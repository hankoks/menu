import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import { playNotificationSound } from '../assets/sounds/notif';

export function useNotifications(playAudio = true) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [session, setSession] = useState(null);

    // Initial fetch and setup
    useEffect(() => {
        let subscription = null;

        const setupRealtime = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            setSession(session);

            const userId = session.user.id;

            // 1. Fetch existing unread notifications for this user
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }

            // 2. Subscribe to new notifications
            subscription = supabase.channel(`notifications:recipient_id=eq.${userId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${userId}`
                    },
                    (payload) => {
                        const newNotif = payload.new;
                        setNotifications(prev => [newNotif, ...prev]);
                        setUnreadCount(prev => prev + 1);

                        // Play sound if enabled
                        if (playAudio) {
                            playNotificationSound();
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${userId}`
                    },
                    (payload) => {
                        const updated = payload.new;
                        setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));

                        // Recalculate unread count
                        setUnreadCount(prev => {
                            // Can't reliably just subtract 1 without reading full state sometimes, but this is safe:
                            return updated.is_read && prev > 0 ? prev - 1 : prev;
                        });
                    }
                )
                .subscribe();
        };

        setupRealtime();

        return () => {
            if (subscription) {
                supabase.removeChannel(subscription);
            }
        };
    }, [playAudio]);

    const markAsRead = async (notificationId) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // DB update
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
    };

    const markAllAsRead = async () => {
        if (!session) return;

        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    };
}
