// chatly - client-side socket logic

(function () {
    'use strict';

    const socket = io();

    // DOM refs
    const landingScreen = document.getElementById('landing');
    const chatApp = document.getElementById('chat-app');
    const joinForm = document.getElementById('join-form');
    const usernameInput = document.getElementById('username-input');
    const joinError = document.getElementById('join-error');
    const displayUsername = document.getElementById('display-username');
    const roomList = document.getElementById('room-list');
    const userList = document.getElementById('user-list');
    const onlineCount = document.getElementById('online-count');
    const currentRoomName = document.getElementById('current-room-name');
    const messagesArea = document.getElementById('messages');
    const msgForm = document.getElementById('msg-form');
    const msgInput = document.getElementById('msg-input');
    const typingIndicator = document.getElementById('typing-indicator');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    // room modal
    const roomModal = document.getElementById('room-modal');
    const createRoomBtn = document.getElementById('create-room-btn');
    const roomForm = document.getElementById('room-form');
    const roomNameInput = document.getElementById('room-name-input');
    const modalCancel = document.getElementById('modal-cancel');

    let myUsername = '';
    let currentRoom = '';
    let typingTimeout = null;
    let isTyping = false;

    // --- join flow ---

    joinForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = usernameInput.value.trim();
        if (!name) {
            joinError.textContent = 'Please enter a username';
            return;
        }
        joinError.textContent = '';
        socket.emit('user_join', { username: name });
    });

    socket.on('error', function (data) {
        joinError.textContent = data.msg || 'Something went wrong';
    });

    socket.on('joined', function (data) {
        myUsername = data.username;
        currentRoom = data.room;

        // switch screens
        landingScreen.classList.add('hidden');
        chatApp.classList.remove('hidden');

        displayUsername.textContent = myUsername;
        currentRoomName.textContent = '# ' + currentRoom;

        renderRooms(data.rooms);
        renderUsers(data.online_users);
        renderHistory(data.history);

        msgInput.focus();
    });

    // --- messaging ---

    msgForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = msgInput.value.trim();
        if (!text) return;

        socket.emit('send_message', { message: text });
        msgInput.value = '';

        // stop typing indicator
        if (isTyping) {
            isTyping = false;
            socket.emit('typing', { is_typing: false });
        }
    });

    socket.on('new_message', function (msg) {
        appendMessage(msg);
        scrollToBottom();
    });

    // --- typing indicator ---

    msgInput.addEventListener('input', function () {
        if (!isTyping) {
            isTyping = true;
            socket.emit('typing', { is_typing: true });
        }
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(function () {
            isTyping = false;
            socket.emit('typing', { is_typing: false });
        }, 2000);
    });

    var typingUsers = {};

    socket.on('user_typing', function (data) {
        if (data.is_typing) {
            typingUsers[data.username] = true;
        } else {
            delete typingUsers[data.username];
        }
        updateTypingDisplay();
    });

    function updateTypingDisplay() {
        var names = Object.keys(typingUsers);
        if (names.length === 0) {
            typingIndicator.textContent = '';
        } else if (names.length === 1) {
            typingIndicator.textContent = names[0] + ' is typing...';
        } else if (names.length === 2) {
            typingIndicator.textContent = names[0] + ' and ' + names[1] + ' are typing...';
        } else {
            typingIndicator.textContent = 'Several people are typing...';
        }
    }

    // --- rooms ---

    function renderRooms(rooms) {
        roomList.innerHTML = '';
        rooms.forEach(function (room) {
            var li = document.createElement('li');
            li.textContent = room;
            if (room === currentRoom) {
                li.classList.add('active');
            }
            li.addEventListener('click', function () {
                if (room !== currentRoom) {
                    socket.emit('switch_room', { room: room });
                }
            });
            roomList.appendChild(li);
        });
    }

    socket.on('room_changed', function (data) {
        currentRoom = data.room;
        currentRoomName.textContent = '# ' + currentRoom;
        typingUsers = {};
        updateTypingDisplay();
        renderUsers(data.online_users);
        renderHistory(data.history);

        // highlight the active room in the list
        var items = roomList.querySelectorAll('li');
        items.forEach(function (item) {
            item.classList.toggle('active', item.textContent === currentRoom);
        });

        // close sidebar on mobile
        sidebar.classList.remove('open');
        msgInput.focus();
    });

    socket.on('room_list_updated', function (rooms) {
        renderRooms(rooms);
    });

    // create room modal
    createRoomBtn.addEventListener('click', function () {
        roomModal.classList.remove('hidden');
        roomNameInput.value = '';
        roomNameInput.focus();
    });

    modalCancel.addEventListener('click', function () {
        roomModal.classList.add('hidden');
    });

    roomModal.addEventListener('click', function (e) {
        if (e.target === roomModal) {
            roomModal.classList.add('hidden');
        }
    });

    roomForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = roomNameInput.value.trim().toLowerCase().replace(/\s+/g, '-');
        if (!name) return;
        socket.emit('create_room', { room: name });
        roomModal.classList.add('hidden');
    });

    // --- online users ---

    function renderUsers(users) {
        userList.innerHTML = '';
        users.forEach(function (username) {
            var li = document.createElement('li');
            li.textContent = username;
            userList.appendChild(li);
        });
        onlineCount.textContent = users.length;
    }

    socket.on('user_joined', function (data) {
        renderUsers(data.online_users);
    });

    socket.on('user_left', function (data) {
        renderUsers(data.online_users);
        // clean up typing state for the user who left
        delete typingUsers[data.username];
        updateTypingDisplay();
    });

    socket.on('update_user_list', function (users) {
        // we get the global user list here, but we only show room users
        // just update the count badge for now
    });

    // --- message rendering ---

    function renderHistory(messages) {
        messagesArea.innerHTML = '';
        messages.forEach(function (msg) {
            appendMessage(msg);
        });
        scrollToBottom();
    }

    function appendMessage(msg) {
        var div = document.createElement('div');

        if (msg.type === 'system') {
            div.className = 'msg msg-system';
            div.innerHTML = '<div class="msg-bubble">' + escapeHtml(msg.message) + '</div>';
        } else {
            var isSelf = msg.username === myUsername;
            div.className = 'msg ' + (isSelf ? 'self' : 'other');

            var metaHtml = '<div class="msg-meta">';
            if (!isSelf) {
                metaHtml += '<span class="msg-username">' + escapeHtml(msg.username) + '</span>';
            }
            metaHtml += '<span class="msg-time">' + escapeHtml(msg.timestamp) + '</span>';
            metaHtml += '</div>';

            div.innerHTML = metaHtml + '<div class="msg-bubble">' + escapeHtml(msg.message) + '</div>';
        }

        messagesArea.appendChild(div);
    }

    function scrollToBottom() {
        // small delay so the DOM has time to update
        setTimeout(function () {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }, 50);
    }

    function escapeHtml(str) {
        var temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // --- mobile sidebar toggle ---

    sidebarToggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
    });

    // close sidebar when clicking outside on mobile
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 768 &&
            sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            e.target !== sidebarToggle) {
            sidebar.classList.remove('open');
        }
    });

})();
