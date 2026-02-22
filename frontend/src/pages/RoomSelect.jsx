import { useState } from 'react'
import './RoomSelect.css'

function RoomSelect({ user, onJoin }) {
    const [room, setRoom] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        const cleaned = room.trim().toLowerCase().replace(/\s+/g, '-')
        if (!cleaned) return
        onJoin(cleaned)
    }

    return (
        <div className="room-select-screen">
            <div className="room-select-bg">
                <div className="bg-orb orb-1"></div>
                <div className="bg-orb orb-2"></div>
            </div>

            <div className="room-select-card">
                <div className="logo-small">
                    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                        <rect width="40" height="40" rx="12" fill="url(#logo-grad-room)" />
                        <path d="M12 14h16a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4h-4a2 2 0 01-2-2v-8a2 2 0 012-2z" fill="rgba(255,255,255,0.9)" />
                        <defs>
                            <linearGradient id="logo-grad-room" x1="0" y1="0" x2="40" y2="40">
                                <stop stopColor="#7c3aed" />
                                <stop offset="1" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <h1>PulseChat</h1>
                </div>

                <div className="user-welcome">
                    {user.profile_pic ? (
                        <img src={user.profile_pic} alt="" className="welcome-avatar" />
                    ) : (
                        <div className="welcome-avatar-dot" />
                    )}
                    <h2>Welcome, {user.name}!</h2>
                </div>

                <p className="instruction">Which room would you like to join?</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="e.g. general, random, dev-talk..."
                        maxLength={20}
                        autoFocus
                        required
                    />
                    <button type="submit" className="join-room-btn">
                        Join Room
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RoomSelect
