import { useState, useRef, useEffect, useCallback } from 'react'
import './ChatBox.css'

function ChatBox({ messages, user, onSend, onTyping }) {
    const [text, setText] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const messagesEndRef = useRef(null)
    const fileRef = useRef()
    const typingTimeout = useRef(null)
    const isTyping = useRef(false)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleTyping = useCallback(() => {
        if (!isTyping.current) {
            isTyping.current = true
            onTyping(true)
        }
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => {
            isTyping.current = false
            onTyping(false)
        }, 2000)
    }, [onTyping])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!text.trim() && !imagePreview) return
        onSend(text.trim(), imagePreview)
        setText('')
        setImagePreview('')
        if (isTyping.current) {
            isTyping.current = false
            onTyping(false)
            clearTimeout(typingTimeout.current)
        }
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be under 2MB')
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)
    }

    return (
        <>
            <div className="messages-area">
                {messages.map((msg, i) => {
                    if (msg.type === 'system') {
                        return (
                            <div key={msg.id || i} className="msg msg-system">
                                <div className="msg-bubble">{msg.message}</div>
                            </div>
                        )
                    }

                    const isSelf = msg.email === user.email
                    return (
                        <div key={msg.id || i} className={`msg ${isSelf ? 'self' : 'other'}`}>
                            <div className="msg-meta">
                                {!isSelf && (
                                    <>
                                        {msg.profile_pic ? (
                                            <img src={msg.profile_pic} alt="" className="msg-avatar" />
                                        ) : (
                                            <div className="msg-avatar-dot">{msg.username?.[0]?.toUpperCase() || '?'}</div>
                                        )}
                                        <span className="msg-username">{msg.username}</span>
                                    </>
                                )}
                                <span className="msg-time">{msg.timestamp}</span>
                            </div>
                            {msg.image && (
                                <img src={msg.image} alt="shared" className="msg-image" />
                            )}
                            {msg.message && (
                                <div className="msg-bubble">{msg.message}</div>
                            )}
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {imagePreview && (
                <div className="image-preview-bar">
                    <img src={imagePreview} alt="preview" />
                    <button onClick={() => setImagePreview('')}>✕</button>
                </div>
            )}

            <form className="message-form" onSubmit={handleSubmit}>
                <button
                    type="button"
                    className="attach-btn"
                    onClick={() => fileRef.current?.click()}
                    title="Send Image"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                />
                <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value)
                        handleTyping()
                    }}
                    placeholder="Type a message..."
                    autoComplete="off"
                    maxLength={1000}
                />
                <button type="submit" className="send-btn" title="Send">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                </button>
            </form>
        </>
    )
}

export default ChatBox
