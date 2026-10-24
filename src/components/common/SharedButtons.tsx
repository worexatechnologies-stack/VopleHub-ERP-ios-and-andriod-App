import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { VolpeTheme } from '../../theme/theme';

export function PrimaryButton({ title, onPress, tone = 'primary', disabled }: { title: string; onPress: () => void; tone?: 'primary' | 'dark' | 'ghost'; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[s.btn, tone === 'primary' && s.primary, tone === 'dark' && s.dark, tone === 'ghost' && s.ghost]}
    >
      <Text style={[s.text, tone === 'ghost' && s.textGhost]}>{title}</Text>
    </Pressable>
  );
}

export function DetailRow({ title, meta, right }: { title: string; meta?: string; right?: React.ReactNode }) {
  return (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        {meta ? <Text style={s.meta}>{meta}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  btn: { marginTop: 10, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignItems: 'center' },
  primary: { backgroundColor: VolpeTheme.colors.primary },
  dark: { backgroundColor: '#0F172A' },
  ghost: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  text: { color: '#fff', fontWeight: '800', fontSize: 13 },
  textGhost: { color: '#334155' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  title: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  meta: { fontSize: 11, color: '#64748B', marginTop: 2 },
});
