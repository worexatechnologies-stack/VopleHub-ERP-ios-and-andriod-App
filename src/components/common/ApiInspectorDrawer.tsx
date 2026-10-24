// Native port of src/components/common/ApiInspectorDrawer.tsx
// Tabs: live logs + endpoint catalog + backend URL settings.
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, FlatList, TextInput, ScrollView } from 'react-native';
import type { ApiLogEntry } from '../../types/api-log';
import { getBaseUrl, setBaseUrl } from '../../services/schoolApi';

export function ApiInspectorDrawer({ isOpen, onClose, logs, onClearLogs }: {
  isOpen: boolean; onClose: () => void; logs: ApiLogEntry[]; onClearLogs: () => void;
}) {
  const [tab, setTab] = useState<'live' | 'catalog' | 'settings'>('live');
  const [url, setUrl] = useState(getBaseUrl());
  const catalog = [
    { method: 'POST', path: '/auth/login/', desc: 'SimpleJWT login with role check.' },
    { method: 'GET', path: '/auth/me/', desc: 'Session restore.' },
    { method: 'POST', path: '/auth/presence/heartbeat/', desc: '30s online heartbeat.' },
    { method: 'GET', path: '/students/', desc: 'Student list.' },
    { method: 'GET', path: '/exam-schedules/', desc: 'Exam lifecycle.' },
    { method: 'POST', path: '/chatbot/ask/', desc: 'AI assistant (20/hr).' },
  ];
  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={onClose}>
      <View style={s.wrap}>
        <View style={s.bar}>
          <Text style={s.title}>DRF API Inspector ({logs.length})</Text>
          <Pressable onPress={onClose}><Text style={s.close}>Close</Text></Pressable>
        </View>
        <View style={s.tabs}>
          {(['live', 'catalog', 'settings'] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[s.pill, tab === t && s.on]}>
              <Text style={tab === t ? s.onT : s.pillT}>{t.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        {tab === 'live' ? (
          <FlatList
            data={logs}
            keyExtractor={(l) => l.id}
            contentContainerStyle={{ padding: 10, gap: 8 }}
            renderItem={({ item }) => (
              <View style={s.log}>
                <Text style={s.mono}>{item.method} {item.endpoint} - {item.status} ({item.durationMs}ms)</Text>
                <Text style={s.mini}>{item.timestamp}</Text>
              </View>
            )}
            ListHeaderComponent={
              <Pressable onPress={onClearLogs} style={s.clear}><Text style={s.clearT}>Clear logs</Text></Pressable>
            }
          />
        ) : tab === 'catalog' ? (
          <ScrollView contentContainerStyle={{ padding: 10, gap: 8 }}>
            {catalog.map((c, i) => (
              <View key={i} style={s.log}>
                <Text style={s.mono}>{c.method} {c.path}</Text>
                <Text style={s.mini}>{c.desc}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={{ padding: 12, gap: 8 }}>
            <Text style={s.label}>Backend Base URL</Text>
            <TextInput value={url} onChangeText={setUrl} autoCapitalize="none" style={s.input} />
            <Pressable onPress={() => setBaseUrl(url)} style={s.save}>
              <Text style={s.saveT}>Save URL</Text>
            </Pressable>
            <Text style={s.mini}>Production: https://volpehub.in/api/v1</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#020617' },
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  title: { color: '#fff', fontWeight: '800', fontSize: 14 },
  close: { color: '#93c5fd', fontWeight: '800' },
  tabs: { flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingBottom: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1e293b' },
  on: { backgroundColor: '#2563eb' },
  pillT: { color: '#cbd5e1', fontSize: 11, fontWeight: '800' },
  onT: { color: '#fff', fontSize: 11, fontWeight: '800' },
  log: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 10 },
  mono: { color: '#e2e8f0', fontSize: 12, fontFamily: 'monospace' },
  mini: { color: '#64748b', fontSize: 10, marginTop: 2 },
  clear: { padding: 10, alignItems: 'center' },
  clearT: { color: '#f87171', fontWeight: '800' },
  label: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  input: { backgroundColor: '#0f172a', color: '#fff', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 10, fontSize: 12 },
  save: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center' },
  saveT: { color: '#fff', fontWeight: '800' },
});
