import './polyfills';
import { ensureBtoa } from './polyfills';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, View, Pressable, LogBox } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

LogBox.ignoreAllLogs(true);
import type { User, Role } from './types/auth';
import type { ApiLogEntry } from './types/api-log';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LoginScreen } from './components/auth/LoginScreen';
import { ChatModule } from './components/shared/ChatModule';
import { EventsModule } from './components/shared/EventsModule';
import { NotificationsView } from './components/shared/NotificationsView';
import { ForcedPasswordModal } from './components/common/ForcedPasswordModal';
import { ApiInspectorDrawer } from './components/common/ApiInspectorDrawer';
import { SplashScreen } from './components/common/SplashScreen';
import { NotificationBanner } from './components/common/NotificationBanner';
import { VolpeTheme } from './theme/theme';
import { initMobileStorage } from './services/memoryStore';
import { pushNotificationService } from './services/pushNotificationService';
import { logger } from './utils/logger';
import {
  addApiLogListener,
  getStoredUser,
  setStoredUser,
  getStoredToken,
  setStoredToken,
  apiGetMe,
  apiHeartbeat,
  apiLogout,
} from './services/schoolApi';
import { onAuthExpired } from './config/api';

export default function App() {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);
  const [forcePwd, setForcePwd] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [tab, setTab] = useState<'home' | 'chat' | 'events' | 'notifs'>('home');
  const [targetConversationId, setTargetConversationId] = useState<number | null>(null);

  useEffect(() => {
    ensureBtoa();
    initMobileStorage().then(() => {
      const token = getStoredToken();
      const user = getStoredUser();
      if (user) {
        setCurrentUser(user);
      } else {
        setStoredToken(null);
        setStoredUser(null);
        setCurrentUser(null);
      }
      // Show brand splash for at least 800ms
      setTimeout(() => {
        setReady(true);
      }, 800);
    });
    const unsubLogs = addApiLogListener((entry) => setApiLogs((prev) => [entry, ...prev.slice(0, 49)]));
    const unsubAuth = onAuthExpired(() => {
      if (!__DEV__) {
        setStoredToken(null);
        setStoredUser(null);
        setCurrentUser(null);
        setTab('home');
      }
    });
    return () => {
      unsubLogs();
      unsubAuth();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await pushNotificationService.unregisterDevice();
      await apiLogout();
    } catch {}
    setStoredToken(null);
    setStoredUser(null);
    setCurrentUser(null);
    setTab('home');
    setForcePwd(false);
  };

  useEffect(() => {
    if (currentUser?.id) {
      pushNotificationService.init(currentUser.id);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const unsub = pushNotificationService.onNotificationTap((payload) => {
      const type = payload.data?.type;
      const rawConvId = payload.data?.conversationId;
      if (type === 'chat_message' || rawConvId) {
        const convId = rawConvId ? Number(rawConvId) : null;
        if (convId && !isNaN(convId)) {
          setTargetConversationId(convId);
        }
        setTab('chat');
      } else if (type === 'event' || payload.data?.eventId) {
        setTab('events');
      } else if (type === 'notice' || payload.data?.notificationId) {
        setTab('notifs');
      } else {
        setTab('notifs');
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    const restore = async () => {
      if (!getStoredToken()) return;
      try {
        const user = await apiGetMe();
        if (alive) {
          setCurrentUser(user);
          if (user.mustChangePassword) setForcePwd(true);
        }
      } catch (err: any) {
        if (alive && err?.response?.status === 401) {
          if (!__DEV__) {
            handleLogout();
          }
        }
      }
    };
    restore();
    return () => { alive = false; };
  }, [ready]);

  useEffect(() => {
    if (!currentUser) return;
    const id = setInterval(async () => {
      try {
        await apiHeartbeat();
      } catch {
        logger.warn('Heartbeat tick failed');
      }
    }, 30000);
    return () => clearInterval(id);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.mustChangePassword) setForcePwd(true);
  }, [currentUser]);

  const homeView = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'super_admin' || currentUser.role === 'school_admin') {
      return (
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' }}>
            Administrative Web Portal
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 20, maxWidth: 320 }}>
            Administrator and Super Admin consoles are managed on the web application. Please access the web portal or log in as Teacher, Parent, or Student on mobile.
          </Text>
          <Pressable
            onPress={handleLogout}
            style={{ backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Switch to Mobile Portal</Text>
          </Pressable>
        </View>
      );
    }
    if (currentUser.role === 'teacher') {
      return (
        <TeacherDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenChat={() => setTab('chat')}
          onOpenNotifications={() => setTab('notifs')}
        />
      );
    }
    if (currentUser.role === 'parent') {
      return (
        <ParentDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenChat={() => setTab('chat')}
          onOpenNotifications={() => setTab('notifs')}
        />
      );
    }
    if (currentUser.role === 'student') {
      return (
        <StudentDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenEvents={() => setTab('events')}
          onOpenChat={() => setTab('chat')}
          onOpenNotifications={() => setTab('notifs')}
        />
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <EventsModule onClose={() => {}} />
        <View style={{ padding: 12 }}>
          <Pressable
            onPress={handleLogout}
            style={{ backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Logout</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (!ready) {
    return <SplashScreen />;
  }

  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'left', 'right', 'bottom']}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <LoginScreen
            onLoginSuccess={(u) => {
              setCurrentUser(u);
              if (u.mustChangePassword) setForcePwd(true);
            }}
          />
          <ForcedPasswordModal
            isOpen={forcePwd}
            onSuccess={() => setForcePwd(false)}
            onLogout={handleLogout}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: VolpeTheme.colors.background }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={VolpeTheme.colors.background} />
        {tab === 'home' ? (
          homeView()
        ) : tab === 'chat' ? (
          <ChatModule
            currentUser={currentUser}
            initialConversationId={targetConversationId}
            onClose={() => {
              setTargetConversationId(null);
              setTab('home');
            }}
          />
        ) : tab === 'events' ? (
          <EventsModule onClose={() => setTab('home')} />
        ) : (
          <NotificationsView onClose={() => setTab('home')} />
        )}

        {__DEV__ ? (
          <Pressable
            onPress={() => setShowInspector(true)}
            style={{ position: 'absolute', right: 12, bottom: 86, backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999 }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>API ({apiLogs.length})</Text>
          </Pressable>
        ) : null}

        <ForcedPasswordModal
          isOpen={forcePwd}
          onSuccess={() => {
            setForcePwd(false);
            const updated = { ...currentUser, mustChangePassword: false };
            setCurrentUser(updated);
            setStoredUser(updated);
          }}
          onLogout={handleLogout}
        />

        <ApiInspectorDrawer
          isOpen={__DEV__ && showInspector}
          onClose={() => setShowInspector(false)}
          logs={apiLogs}
          onClearLogs={() => setApiLogs([])}
        />

        <NotificationBanner />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
