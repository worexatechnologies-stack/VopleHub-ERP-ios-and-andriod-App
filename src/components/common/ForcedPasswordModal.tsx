import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { VolpeTheme } from '../../theme/theme';
import { apiChangePassword, apiLogout } from '../../services/schoolApi';
import { validateNewPassword } from '../../utils/validation';

export function ForcedPasswordModal({
  isOpen,
  onSuccess,
  onLogout,
}: {
  isOpen: boolean;
  onSuccess: () => void;
  onLogout: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    const invalid = validateNewPassword(password, confirm);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (loading) return;
    try {
      setLoading(true);
      await apiChangePassword({ password });
      setPassword('');
      setConfirm('');
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={s.bg}>
        <View style={s.card}>
          <Text style={s.badge}>SECURITY REQUIRED</Text>
          <Text style={s.title}>Update Temporary Password</Text>
          <Text style={s.sub}>
            Your account is currently using an initial temporary password. Please set a strong, personal password to continue.
          </Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.err}>{error}</Text>
            </View>
          ) : null}

          <Text style={s.label}>New Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={s.input}
            placeholder="Min. 8 characters"
            placeholderTextColor={VolpeTheme.colors.textLight}
          />

          <Text style={s.label}>Confirm New Password</Text>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            style={s.input}
            placeholder="Re-type password"
            placeholderTextColor={VolpeTheme.colors.textLight}
          />

          <Pressable onPress={submit} disabled={loading} style={s.btn}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={s.btnT}>Save & Continue</Text>
            )}
          </Pressable>

          <Pressable
            onPress={async () => {
              try {
                await apiLogout();
              } catch {}
              onLogout();
            }}
            style={s.ghost}
          >
            <Text style={s.ghostText}>Cancel & Logout</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: VolpeTheme.radius.xl,
    padding: 24,
    ...VolpeTheme.shadows.floating,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: VolpeTheme.colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: VolpeTheme.colors.textPrimary,
  },
  sub: {
    fontSize: 13,
    color: VolpeTheme.colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: VolpeTheme.colors.dangerLight,
    padding: 10,
    borderRadius: VolpeTheme.radius.md,
    marginBottom: 12,
  },
  err: {
    color: VolpeTheme.colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: VolpeTheme.colors.textSecondary,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: VolpeTheme.colors.borderStrong,
    borderRadius: VolpeTheme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: VolpeTheme.colors.textPrimary,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  btn: {
    backgroundColor: VolpeTheme.colors.primary,
    borderRadius: VolpeTheme.radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
    ...VolpeTheme.shadows.card,
  },
  btnT: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  ghost: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  ghostText: {
    color: VolpeTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
