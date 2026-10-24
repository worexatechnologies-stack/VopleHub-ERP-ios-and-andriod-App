import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/formatters';

export function FeeMetrics({ total, paid, due }: { total: number | string; paid: number | string; due: number | string }) {
  return (
    <View style={s.metrics}>
      <View style={s.metric}>
        <Text style={s.label}>TOTAL</Text>
        <Text style={s.value}>{formatCurrency(total)}</Text>
      </View>
      <View style={s.metric}>
        <Text style={s.label}>PAID</Text>
        <Text style={[s.value, { color: '#16A34A' }]}>{formatCurrency(paid)}</Text>
      </View>
      <View style={s.metric}>
        <Text style={s.label}>DUE</Text>
        <Text style={[s.value, { color: '#DC2626' }]}>{formatCurrency(due)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: 8, marginTop: 12 },
  metric: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 10 },
  label: { fontSize: 9, fontWeight: '800', color: '#64748B' },
  value: { fontSize: 15, fontWeight: '900', color: '#0F172A', marginTop: 2 },
});
