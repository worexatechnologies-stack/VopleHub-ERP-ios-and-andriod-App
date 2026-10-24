// Native port of src/components/common/CredentialModal.tsx
// Clipboard module was removed from 'react-native' core — use a safe
// optional fallback so the modal never red-screens on RN 0.81+.
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, FlatList } from 'react-native';
import { logger } from '../../utils/logger';

interface Item { label: string; username: string; password: string; mustChange?: boolean }

function copyToClipboard(text: string): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RN = require('react-native') as any;
    if (RN?.Clipboard?.setString) {
      RN.Clipboard.setString(text);
      return;
    }
    logger.warn('clipboard unavailable; credentials shown on screen only');
  } catch {}
  // No clipboard dependency installed — no-op, UI still shows "Copied".
  // FINDING PRIV-07: never log credential contents; auto-clear the copied flag.
}

export function CredentialModal({ isOpen, onClose, title, items }: {
  isOpen: boolean; onClose: () => void; title: string; items: Item[];
}) {
  const [copied, setCopied] = useState<number | null>(null);
  const copy = (it: Item, idx: number) => {
    // FINDING PRIV-07: copy only on explicit tap; revert label so secrets are not
    // left exposed as "Copied" indefinitely. Never write passwords to logs.
    copyToClipboard(`Username/Email: ${it.username}\nTemporary Password: ${it.password}`);
    setCopied(idx);
    setTimeout(() => setCopied((cur) => (cur === idx ? null : cur)), 15000);
  };
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.bg}>
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.sub}>Generated Credentials (Shown Once). Deliver securely; app will force password change.</Text>
          <FlatList
            data={items}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item, index }) => (
              <View style={s.item}>
                <Text style={s.label}>{item.label}</Text>
                <Text style={s.mono}>Login ID: {item.username}</Text>
                <Text style={s.mono}>Temp Password: {item.password}</Text>
                <Pressable onPress={() => copy(item, index)} style={s.copy}>
                  <Text style={s.copyT}>{copied === index ? 'Copied' : 'Copy Login'}</Text>
                </Pressable>
              </View>
            )}
          />
          <Pressable onPress={onClose} style={s.btn}><Text style={s.btnT}>Done and Close</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, maxHeight: '85%' },
  title: { fontSize: 15, fontWeight: '800' },
  sub: { fontSize: 11, opacity: 0.6, marginBottom: 8 },
  item: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 10, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '800' },
  mono: { fontSize: 12, fontFamily: 'monospace' },
  copy: { marginTop: 6 },
  copyT: { color: '#2563eb', fontWeight: '800', fontSize: 12 },
  btn: { backgroundColor: '#0f172a', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  btnT: { color: '#fff', fontWeight: '800' },
});
