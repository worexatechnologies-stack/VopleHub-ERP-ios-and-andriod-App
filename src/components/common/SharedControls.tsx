import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { WEEK_DAYS } from '../../utils/constants';

export function DaySelector({ selectedDay, onSelectDay }: { selectedDay: string; onSelectDay: (day: string) => void }) {
  return (
    <View style={s.row}>
      {(WEEK_DAYS as readonly string[]).map((d) => {
        const active = selectedDay === d;
        return (
          <Pressable key={d} onPress={() => onSelectDay(d)} style={[s.pill, active && s.pillActive]}>
            <Text style={[s.text, active && s.textActive]}>{d.slice(0, 3)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SubViewSwitcher<T extends string>({ options, selected, onSelect }: { options: readonly T[] | T[]; selected: T; onSelect: (v: T) => void }) {
  return (
    <View style={s.subs}>
      {options.map((x) => {
        const active = selected === x;
        return (
          <Pressable key={x} onPress={() => onSelect(x)} style={[s.sub, active && s.subActive]}>
            <Text style={[s.subText, active && s.subTextActive]}>{String(x).toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9999, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  pillActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  text: { fontSize: 11, fontWeight: '700', color: '#475569' },
  textActive: { color: '#FFFFFF' },
  subs: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  sub: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9999, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  subActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  subText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  subTextActive: { color: '#fff' },
});
