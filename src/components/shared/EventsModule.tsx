import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { VolpeTheme } from '../../theme/theme';
import { StatusBadge, EmptyState, ModuleHeader, LoadingView } from '../common';
import type { SchoolEvent } from '../../types/communication';
import { apiGetEvents, apiRegisterEvent } from '../../services/schoolApi';
import { logger } from '../../utils/logger';

export function EventsModule({ onClose }: { onClose: () => void }) {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const ev = await apiGetEvents();
        if (alive) setEvents(ev || []);
      } catch (e) {
        logger.warn('events fetch failed');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const register = async (event: SchoolEvent) => {
    if (registeringId != null) return;
    setRegisteringId(event.id);
    try {
      const res = await apiRegisterEvent(event.id, { attendee_name: 'Student / Parent Guest' });
      Alert.alert(
        'Registration Confirmed! 🎟️',
        `Pass for "${event.title}" has been issued.\nTicket Code: ${res.ticket_code}`,
        [{ text: 'Great!' }]
      );
      try {
        const ev = await apiGetEvents();
        setEvents(ev || []);
      } catch {}
    } catch (e: any) {
      Alert.alert('Registration', e.message || 'Pass already generated.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <View style={s.wrap}>
      <ModuleHeader title="Campus Events" subtitle="Competitions & Festivals" onClose={onClose} />

      {loading ? (
        <LoadingView message="Loading calendar events..." />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => String(e.id)}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No campus events scheduled"
              subtitle="Check back later for upcoming sports, arts, and academic competitions."
            />
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardTopRow}>
                <StatusBadge status={(item as any).kind || 'CAMPUS EVENT'} size="sm" />
                <Text style={s.dateText}>{item.eventDate}</Text>
              </View>

              <Text style={s.name}>{item.title}</Text>
              <Text style={s.desc}>{item.description}</Text>

              <View style={s.venueRow}>
                <Text style={s.venueIcon}>📍</Text>
                <Text style={s.venueText}>
                  {item.venue}  •  {(item as any).startTime || '10:00 AM'} - {item.endTime || '01:00 PM'}
                </Text>
              </View>

              <Pressable
                onPress={() => register(item)}
                disabled={registeringId === item.id}
                style={s.btn}
              >
                {registeringId === item.id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={s.btnT}>Register & Get Pass Ticket</Text>
                )}
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: VolpeTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: VolpeTheme.colors.border,
    ...VolpeTheme.shadows.card,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: VolpeTheme.colors.surfaceSubtle,
    borderRadius: VolpeTheme.radius.pill,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: VolpeTheme.colors.primary,
  },
  titleBox: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: VolpeTheme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: VolpeTheme.colors.textMuted,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: VolpeTheme.colors.textMuted,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: VolpeTheme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.border,
    ...VolpeTheme.shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: VolpeTheme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: VolpeTheme.radius.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: VolpeTheme.colors.primary,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: VolpeTheme.colors.textMuted,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: VolpeTheme.colors.textPrimary,
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: VolpeTheme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  venueIcon: {
    fontSize: 14,
  },
  venueText: {
    fontSize: 12,
    color: VolpeTheme.colors.textMuted,
    fontWeight: '500',
  },
  btn: {
    backgroundColor: VolpeTheme.colors.primary,
    borderRadius: VolpeTheme.radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnT: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
