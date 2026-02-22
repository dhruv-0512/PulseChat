import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import RoomSelect from './pages/RoomSelect'

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pulse_chat_user')
    return saved ? JSON.parse(saved) : null
  })

  // New: room state
  const [room, setRoom] = useState(() => {
    return localStorage.getItem('pulse_chat_room') || null
  })

  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      localStorage.setItem('pulse_chat_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('pulse_chat_user')
    }
  }, [user])

  useEffect(() => {
    if (room) {
      localStorage.setItem('pulse_chat_room', room)
    } else {
      localStorage.removeItem('pulse_chat_room')
    }
  }, [room])

  const handleLogin = (userData) => {
    setUser(userData)
    // Don't auto-redirect to chat yet, let them pick a room
    // However, if we're on / route, the effect below or router will handle it?
    // Actually simplicity:
    navigate('/room')
  }

  const handleJoinRoom = (roomName) => {
    setRoom(roomName)
    navigate('/chat')
  }

  const handleLeaveRoom = () => {
    setRoom(null)
    navigate('/room')
  }

  const handleProfileUpdate = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setRoom(null)
    navigate('/')
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to="/room" /> : <Login onLogin={handleLogin} />
        }
      />

      <Route
        path="/room"
        element={
          user ? (
            room ? <Navigate to="/chat" /> : <RoomSelect user={user} onJoin={handleJoinRoom} />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/profile"
        element={
          user ? (
            <Profile user={user} onUpdate={handleProfileUpdate} onBack={() => navigate(room ? '/chat' : '/room')} />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/chat"
        element={
          user && room ? (
            <Chat
              user={user}
              room={room}
              onLeaveRoom={handleLeaveRoom}
              onLogout={handleLogout}
              onProfile={() => navigate('/profile')}
            />
          ) : (
            <Navigate to={user ? "/room" : "/"} />
          )
        }
      />
    </Routes>
  )
}

export default App
