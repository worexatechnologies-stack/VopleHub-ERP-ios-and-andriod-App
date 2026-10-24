import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  Text,
  View,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageSquare, Bell, Calendar, ChevronRight, X } from 'lucide-react-native';
import {
  pushNotificationService,
  PushNotificationPayload,
} from '../../services/pushNotificationService';

export function NotificationBanner() {
  const [currentNotification, setCurrentNotification] = useState<PushNotificationPayload | null>(null);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const insets = useSafeAreaInsets();
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = pushNotificationService.onForegroundNotification((payload) => {
      // Clear existing dismiss timer
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      setCurrentNotification(payload);

      // Slide down banner
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 9,
      }).start();

      // Auto dismiss after 4.5s
      dismissTimerRef.current = setTimeout(() => {
        dismissBanner();
      }, 4500);
    });

    return () => {
      unsub();
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const dismissBanner = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentNotification(null);
    });
  };

  const handlePress = () => {
    if (!currentNotification) return;
    const notif = currentNotification;
    dismissBanner();
    pushNotificationService.dispatchNotificationTap(notif);
  };

  if (!currentNotification) return null;

  const type = currentNotification.data?.type;
  const isChat = type === 'chat_message' || Boolean(currentNotification.data?.conversationId);
  const isEvent = type === 'event' || Boolean(currentNotification.data?.eventId);

  const topInset = Math.max(insets?.top || 0, Platform.OS === 'ios' ? 44 : 20);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: topInset + 6,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Pressable onPress={handlePress} style={styles.card}>
        {/* Left Icon Badge */}
        <View
          style={[
            styles.iconBadge,
            isChat ? styles.iconChat : isEvent ? styles.iconEvent : styles.iconNotice,
          ]}
        >
          {isChat ? (
            <MessageSquare size={16} color="#FFFFFF" />
          ) : isEvent ? (
            <Calendar size={16} color="#FFFFFF" />
          ) : (
            <Bell size={16} color="#FFFFFF" />
          )}
        </View>

        {/* Text Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.appName}>VOLPEHUB</Text>
            <Text style={styles.timeNow}>Just now</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {currentNotification.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {currentNotification.body}
          </Text>
        </View>

        {/* Action button */}
        <View style={styles.actionWrap}>
          <ChevronRight size={16} color="#94A3B8" />
        </View>

        {/* Dismiss Button */}
        <Pressable
          hitSlop={10}
          onPress={dismissBanner}
          style={styles.closeBtn}
        >
          <X size={14} color="#94A3B8" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 20,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconChat: {
    backgroundColor: '#4F46E5',
  },
  iconEvent: {
    backgroundColor: '#0D9488',
  },
  iconNotice: {
    backgroundColor: '#E11D48',
  },
  content: {
    flex: 1,
    paddingRight: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  appName: {
    color: '#818CF8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timeNow: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  body: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
  actionWrap: {
    paddingLeft: 4,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 6,
  },
});
