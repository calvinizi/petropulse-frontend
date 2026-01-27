import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useLogin } from '../context/AuthContext';

/*
 Custom hook for Socket.IO connection
 Manages connection state and user room joining
*/
export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { userId, role } = useLogin();

    useEffect(() => {
        if (!userId) return;

        // Create socket connection
        const newSocket = io(`${process.env.REACT_APP_ASSET_URL}`, {
            transports: ['polling', 'websocket'], 
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            path: '/socket.io/'
        });
        
        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('Connected to Socket.IO');
            console.log('User ID:', userId);
            setIsConnected(true);
            
            // Join user's personal room
            newSocket.emit('join', userId);
            console.log(`Joined room for user ID: ${userId}`);
            
            // If user is supervisor/admin, join role room
            if (role === 'Supervisor' || role === 'Admin') {
                newSocket.emit('join_role', role);
                console.log(`Joined ${role} room`);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`Reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log('Closing socket connection');
            newSocket.close();
        };
    }, [userId, role]);

    return { socket, isConnected };
};

/*
Custom hook specifically for handling notifications
Listens for notification events and calls callback
*/

export const useNotifications = (onNewNotification) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (notification) => {
            console.log('New notification received:', notification);
            
            if (onNewNotification) {
                onNewNotification(notification);
            }
        };

        // Listen for notification events
        socket.on('notification', handleNotification);

        // Cleanup listener on unmount
        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, onNewNotification]);

    return { isConnected };
};