import os
from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from datetime import datetime
import hashlib
import uuid
import base64

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-prod'
CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# ── in-memory data stores ──────────────────────────────────────
registered_users = {}   # email -> {email, name, password_hash, bio, profile_pic, created_at}
online_users = {}       # sid -> {email, name, room, profile_pic}
room_history = {}       # room_name -> [messages]

DEFAULT_ROOMS = ['general', 'random', 'tech']
for r in DEFAULT_ROOMS:
    room_history[r] = []


# ── helpers ─────────────────────────────────────────────────────
def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()


def make_system_message(text):
    return {
        'id': str(uuid.uuid4()),
        'type': 'system',
        'message': text,
        'timestamp': datetime.now().strftime('%H:%M')
    }


def get_users_in_room(room):
    users = []
    for sid, info in online_users.items():
        if info['room'] == room:
            users.append({
                'name': info['name'],
                'email': info['email'],
                'profile_pic': info.get('profile_pic', ''),
            })
    return sorted(users, key=lambda u: u['name'])


def get_all_online_emails():
    return list(set(info['email'] for info in online_users.values()))


def get_room_list():
    return sorted(room_history.keys())


def user_to_public(user):
    return {
        'email': user['email'],
        'name': user['name'],
        'bio': user.get('bio', ''),
        'profile_pic': user.get('profile_pic', ''),
        'is_online': user['email'] in get_all_online_emails()
    }


# ── REST API endpoints ─────────────────────────────────────────

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or '').strip()
    password = (data.get('password') or '').strip()

    if not email or not name or not password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    if email in registered_users:
        return jsonify({'success': False, 'message': 'Email already registered'}), 400

    registered_users[email] = {
        'email': email,
        'name': name,
        'password_hash': hash_password(password),
        'bio': 'Hey there! I am using Chatly',
        'profile_pic': '',
        'created_at': datetime.now().isoformat()
    }

    return jsonify({
        'success': True,
        'user': user_to_public(registered_users[email])
    })


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if email not in registered_users:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    user = registered_users[email]
    if user['password_hash'] != hash_password(password):
        return jsonify({'success': False, 'message': 'Invalid password'}), 401

    return jsonify({
        'success': True,
        'user': user_to_public(user)
    })


@app.route('/api/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()

    if email not in registered_users:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    user = registered_users[email]
    if 'name' in data and data['name'].strip():
        user['name'] = data['name'].strip()
    if 'bio' in data:
        user['bio'] = data['bio'].strip()
    if 'profile_pic' in data:
        user['profile_pic'] = data['profile_pic']

    # update online sessions too
    for sid, info in online_users.items():
        if info['email'] == email:
            info['name'] = user['name']
            info['profile_pic'] = user.get('profile_pic', '')

    return jsonify({
        'success': True,
        'user': user_to_public(user)
    })


@app.route('/api/users', methods=['GET'])
def get_users():
    query = request.args.get('q', '').strip().lower()
    results = []
    for email, user in registered_users.items():
        if query and query not in user['name'].lower() and query not in email:
            continue
        results.append(user_to_public(user))
    return jsonify({'users': results})


# ── Socket.IO events ───────────────────────────────────────────

@socketio.on('connect')
def handle_connect():
    print(f'[+] Client connected: {request.sid}')


@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    if sid in online_users:
        user = online_users[sid]
        name = user['name']
        room = user['room']

        online_users.pop(sid, None)

        emit('user_left', {
            'username': name,
            'room': room,
            'online_users': get_users_in_room(room)
        }, to=room)

        emit('update_user_list', get_all_online_emails(), broadcast=True)

    print(f'[-] Client disconnected: {sid}')


@socketio.on('user_join')
def handle_user_join(data):
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or '').strip()
    profile_pic = data.get('profile_pic', '')

    if not name:
        emit('error', {'msg': 'Name is required'})
        return

    room = (data.get('room') or 'general').strip().lower()
    sid = request.sid

    online_users[sid] = {
        'email': email,
        'name': name,
        'room': room,
        'profile_pic': profile_pic,
    }

    join_room(room)

    emit('joined', {
        'username': name,
        'room': room,
        'rooms': get_room_list(),
        'history': room_history.get(room, []),
        'online_users': get_users_in_room(room)
    })

    emit('user_joined', {
        'username': name,
        'room': room,
        'online_users': get_users_in_room(room)
    }, to=room, include_self=False)

    emit('update_user_list', get_all_online_emails(), broadcast=True)

    sys_msg = make_system_message(f'{name} joined the room')
    room_history[room].append(sys_msg)
    emit('new_message', sys_msg, to=room)


@socketio.on('send_message')
def handle_message(data):
    sid = request.sid
    if sid not in online_users:
        return

    user = online_users[sid]
    text = (data.get('message') or '').strip()
    image = data.get('image', '')  # base64 image data

    if not text and not image:
        return

    msg = {
        'id': str(uuid.uuid4()),
        'type': 'user',
        'username': user['name'],
        'email': user['email'],
        'profile_pic': user.get('profile_pic', ''),
        'message': text,
        'image': image,
        'room': user['room'],
        'timestamp': datetime.now().strftime('%H:%M')
    }

    room = user['room']
    room_history.setdefault(room, []).append(msg)

    while len(room_history[room]) > 200:
        room_history[room].pop(0)

    emit('new_message', msg, to=room)


@socketio.on('switch_room')
def handle_switch_room(data):
    sid = request.sid
    if sid not in online_users:
        return

    user = online_users[sid]
    old_room = user['room']
    new_room = (data.get('room') or '').strip()

    if not new_room or new_room == old_room:
        return

    name = user['name']

    leave_room(old_room)
    sys_msg = make_system_message(f'{name} left the room')
    room_history[old_room].append(sys_msg)
    emit('new_message', sys_msg, to=old_room)
    emit('user_left', {
        'username': name,
        'room': old_room,
        'online_users': get_users_in_room(old_room)
    }, to=old_room)

    user['room'] = new_room
    join_room(new_room)
    room_history.setdefault(new_room, [])

    sys_msg = make_system_message(f'{name} joined the room')
    room_history[new_room].append(sys_msg)

    emit('room_changed', {
        'room': new_room,
        'history': room_history[new_room],
        'online_users': get_users_in_room(new_room)
    })

    emit('new_message', sys_msg, to=new_room)
    emit('user_joined', {
        'username': name,
        'room': new_room,
        'online_users': get_users_in_room(new_room)
    }, to=new_room, include_self=False)


@socketio.on('create_room')
def handle_create_room(data):
    room_name = (data.get('room') or '').strip().lower()
    if not room_name:
        return

    if room_name not in room_history:
        room_history[room_name] = []

    emit('room_list_updated', get_room_list(), broadcast=True)
    handle_switch_room({'room': room_name})


@socketio.on('typing')
def handle_typing(data):
    sid = request.sid
    if sid not in online_users:
        return
    user = online_users[sid]
    emit('user_typing', {
        'username': user['name'],
        'is_typing': data.get('is_typing', False)
    }, to=user['room'], include_self=False)


if __name__ == '__main__':
    print('Starting chat server on http://localhost:5000')
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
