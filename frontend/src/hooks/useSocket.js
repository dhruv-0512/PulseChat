import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = '/'

export function useSocket(user, handlers, room) {
    const socketRef = useRef(null)

    useEffect(() => {
        if (!user) return

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        })
        socketRef.current = socket

        socket.on('connect', () => {
            console.log('[socket] connected:', socket.id)
            socket.emit('user_join', {
                email: user.email,
                name: user.name,
                profile_pic: user.profile_pic || '',
                room: room || 'general',
            })
        })

        socket.on('joined', (data) => handlers.current.onJoined?.(data))
        socket.on('new_message', (data) => handlers.current.onNewMessage?.(data))
        socket.on('user_joined', (data) => handlers.current.onUserJoined?.(data))
        socket.on('user_left', (data) => handlers.current.onUserLeft?.(data))
        socket.on('room_changed', (data) => handlers.current.onRoomChanged?.(data))
        socket.on('room_list_updated', (data) => handlers.current.onRoomListUpdated?.(data))
        socket.on('user_typing', (data) => handlers.current.onUserTyping?.(data))
        socket.on('update_user_list', (data) => handlers.current.onUpdateUserList?.(data))
        socket.on('error', (data) => handlers.current.onError?.(data))

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [user])

    const emit = useCallback((event, data) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data)
        }
    }, [])

    return { emit }
}
