import { useState, useRef } from 'react'
import './Profile.css'

function Profile({ user, onUpdate, onBack }) {
    const [name, setName] = useState(user.name)
    const [bio, setBio] = useState(user.bio || '')
    const [profilePic, setProfilePic] = useState(user.profile_pic || '')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const fileRef = useRef()

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            setMessage('Image must be under 2MB')
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
            setProfilePic(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    name,
                    bio,
                    profile_pic: profilePic,
                }),
            })
            const data = await res.json()
            if (data.success) {
                onUpdate(data.user)
                setMessage('Profile updated!')
            } else {
                setMessage(data.message || 'Failed to update')
            }
        } catch {
            setMessage('Server not reachable')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="profile-screen">
            <div className="profile-card">
                <button className="back-btn" onClick={onBack}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Chat
                </button>

                <h2>Edit Profile</h2>

                <div className="avatar-section" onClick={() => fileRef.current?.click()}>
                    {profilePic ? (
                        <img src={profilePic} alt="avatar" className="avatar-img" />
                    ) : (
                        <div className="avatar-placeholder">
                            {name ? name[0].toUpperCase() : '?'}
                        </div>
                    )}
                    <div className="avatar-overlay">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                </div>

                <form onSubmit={handleSave}>
                    <label>
                        <span>Display Name</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={30}
                        />
                    </label>

                    <label>
                        <span>Bio</span>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            maxLength={150}
                            rows={3}
                        />
                    </label>

                    <label>
                        <span>Email</span>
                        <input type="email" value={user.email} disabled />
                    </label>

                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                {message && (
                    <p className={message.includes('updated') ? 'success-msg' : 'error-msg'}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    )
}

export default Profile
