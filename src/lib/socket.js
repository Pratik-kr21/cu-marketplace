import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const socket = io(SOCKET_URL, {
    autoConnect: false, // Don't connect until user is logged in
    withCredentials: true,
})

export const connectSocket = (userId) => {
    if (!socket.connected) {
        socket.connect()
        // Register the user with the server
        socket.emit('register', userId)
    }
}

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect()
    }
}
