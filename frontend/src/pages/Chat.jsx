import { useState, useRef, useCallback } from 'react'
import { useSocket } from '../hooks/useSocket'
import ChatBox from '../components/ChatBox'
import './Chat.css'

function Chat({ user, room, onLeaveRoom, onLogout, onProfile }) {
    // We'll stick to a single global room "general"
    const [messages, setMessages] = useState([])
    const [onlineUsers, setOnlineUsers] = useState([])
    const [typingUsers, setTypingUsers] = useState({})

    const handlersRef = useRef({})

    handlersRef.current.onJoined = (data) => {
        setMessages(data.history)
        setOnlineUsers(data.online_users)
    }

    handlersRef.current.onNewMessage = (data) => {
        setMessages((prev) => [...prev, data])
    }

    handlersRef.current.onUserJoined = (data) => {
        setOnlineUsers(data.online_users)
    }

    handlersRef.current.onUserLeft = (data) => {
        setOnlineUsers(data.online_users)
        setTypingUsers((prev) => {
            const next = { ...prev }
            delete next[data.username]
            return next
        })
    }

    // we ignore room_changed / list_updated since it's single room

    handlersRef.current.onUserTyping = (data) => {
        setTypingUsers((prev) => {
            const next = { ...prev }
            if (data.is_typing) {
                next[data.username] = true
            } else {
                delete next[data.username]
            }
            return next
        })
    }

    handlersRef.current.onUpdateUserList = (data) => {
        // global user list update, if needed
    }

    handlersRef.current.onError = (data) => {
        console.error('[socket error]', data)
    }

    const { emit } = useSocket(user, handlersRef, room)

    const sendMessage = useCallback((text, image) => {
        emit('send_message', { message: text, image: image || '' })
    }, [emit])

    const sendTyping = useCallback((isTyping) => {
        emit('typing', { is_typing: isTyping })
    }, [emit])

    const typingNames = Object.keys(typingUsers)
    let typingText = ''
    if (typingNames.length === 1) typingText = `${typingNames[0]} is typing...`
    else if (typingNames.length === 2) typingText = `${typingNames[0]} and ${typingNames[1]} are typing...`
    else if (typingNames.length > 2) typingText = 'Several people are typing...'

    return (
        <div className="chat-app single-room">
            <main className="chat-main">
                <header className="chat-header">
                    <div className="header-left">
                        <div className="logo-tiny">
                            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="12" fill="url(#logo-grad-header)" />
                                <path d="M12 14h16a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4h-4a2 2 0 01-2-2v-8a2 2 0 012-2z" fill="rgba(255,255,255,0.9)" />
                                <defs>
                                    <linearGradient id="logo-grad-header" x1="0" y1="0" x2="40" y2="40">
                                        <stop stopColor="#7c3aed" />
                                        <stop offset="1" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <h1>PulseChat</h1>
                        </div>
                    </div>

                    <div className="header-center">
                        {typingText ? (
                            <span className="typing-indicator">{typingText}</span>
                        ) : (
                            <span className="room-status">
                                <span className="online-dot"></span>
                                {onlineUsers.length} online
                            </span>
                        )}
                    </div>

                    <div className="header-right">
                        <button onClick={onLeaveRoom} className="leave-room-btn" title="Leave Room">
                            Leave
                        </button>
                        <div className="user-profile" onClick={onProfile} title="Edit Profile">
                            {user.profile_pic ? (
                                <img src={user.profile_pic} alt="" className="header-avatar" />
                            ) : (
                                <div className="header-avatar-dot" />
                            )}
                            <span className="header-username">{user.name}</span>
                        </div>
                        <button onClick={onLogout} title="Logout" className="icon-btn logout-header">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </header>

                <ChatBox
                    messages={messages}
                    user={user}
                    onSend={sendMessage}
                    onTyping={sendTyping}
                />
            </main>
        </div>
    )
}

export default Chat
