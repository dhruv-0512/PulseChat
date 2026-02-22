import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
    const [isSignup, setIsSignup] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const endpoint = isSignup ? '/api/signup' : '/api/login'
            const body = isSignup
                ? { name, email, password }
                : { email, password }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!data.success) {
                setError(data.message || 'Something went wrong')
            } else {
                onLogin(data.user)
            }
        } catch (err) {
            setError('Server not reachable')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-screen">
            <div className="login-bg">
                <div className="bg-orb orb-1"></div>
                <div className="bg-orb orb-2"></div>
                <div className="bg-orb orb-3"></div>
            </div>

            <div className="login-card">
                <div className="logo">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect width="40" height="40" rx="12" fill="url(#logo-grad)" />
                        <path
                            d="M12 14h16a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4h-4a2 2 0 01-2-2v-8a2 2 0 012-2z"
                            fill="rgba(255,255,255,0.9)"
                        />
                        <defs>
                            <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
                                <stop stopColor="#7c3aed" />
                                <stop offset="1" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <h1>PulseChat</h1>
                </div>
                <p className="tagline">
                    {isSignup ? 'Create your account' : 'Welcome back'}
                </p>

                <form onSubmit={handleSubmit}>
                    {isSignup && (
                        <input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={isSignup ? 'new-password' : 'current-password'}
                        minLength={3}
                    />
                    <button type="submit" className="btn-submit" disabled={loading}>
                        <span>{loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}</span>
                        {!loading && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </form>

                {error && <p className="error-msg">{error}</p>}

                <p className="switch-text">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        className="switch-btn"
                        onClick={() => {
                            setIsSignup(!isSignup)
                            setError('')
                        }}
                    >
                        {isSignup ? 'Log In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Login
