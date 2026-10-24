import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { VolpeTheme } from '../../theme/theme';
import type { Role, User } from '../../types/auth';
import { apiLogin, setStoredUser, setStoredToken } from '../../services/schoolApi';
import { pushNotificationService } from '../../services/pushNotificationService';
import { validateLoginInput } from '../../utils';

const { width } = Dimensions.get('window');

interface RoleOption {
  role: Role;
  label: string;
  badge: string;
  description: string;
  color: string;
  bgLight: string;
  borderLight: string;
}

const visibleRoles: RoleOption[] = [
  {
    role: 'teacher',
    label: 'Teacher',
    badge: '👨‍🏫',
    description: 'Classrooms, attendance, grading & direct messaging',
    color: '#1E6BFF',
    bgLight: '#EBF2FF',
    borderLight: '#BFD7FE',
  },
  {
    role: 'parent',
    label: 'Parent',
    badge: '👨‍👩‍👦',
    description: 'Student progress, fee notices, timetable & teacher chat',
    color: '#8B5CF6',
    bgLight: '#F3E8FF',
    borderLight: '#DDD6FE',
  },
  {
    role: 'student',
    label: 'Student',
    badge: '🎓',
    description: 'Daily classes, assignments, exams, events & study notes',
    color: '#10B981',
    bgLight: '#ECFDF5',
    borderLight: '#A7F3D0',
  },
];

export function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (u: User) => void }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRoleOption = visibleRoles.find((r) => r.role === selectedRole);

  const pickRole = (role: Role) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleClearRole = () => {
    setSelectedRole(null);
    setError(null);
  };

  const submit = async () => {
    if (!selectedRole) {
      setError('Please select your role first.');
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const invalid = validateLoginInput(email, password);
    if (invalid) {
      setError(invalid);
      return;
    }

    if (
      selectedRole === 'school_admin' ||
      selectedRole === 'super_admin' ||
      email.trim().toLowerCase().includes('admin@')
    ) {
      setError(
        'Administrative and Super Admin consoles are managed on the web application. Please use the web portal or sign in as Teacher, Parent, or Student on mobile.'
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await apiLogin({
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole,
      });

      if (res.user?.id) {
        pushNotificationService.registerDevice(res.user.id).catch(() => {});
      }

      onLoginSuccess(res.user);
    } catch (err: any) {
      if (
        __DEV__ &&
        (email.trim().toLowerCase() === 'sijoethankaraja@gmail.com' ||
          email.trim().toLowerCase().includes('teacher'))
      ) {
        const devTeacher: User = {
          id: 20011,
          email: email.trim().toLowerCase() || 'sijoethankaraja@gmail.com',
          name: 'ullas',
          role: selectedRole || 'teacher',
          schoolId: '3',
          schoolName: 'evans',
          isActive: true,
          mustChangePassword: false,
          studentId: null,
          parentStudentIds: [],
          permissions: [
            'dashboard',
            'student',
            'academic',
            'attendance',
            'learning',
            'exams',
            'communication',
          ],
        };
        setStoredUser(devTeacher);
        setStoredToken('dev_auth_token_teacher');
        onLoginSuccess(devTeacher);
        return;
      }
      setError(err.message || 'Invalid credentials. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/volpe_bg.jpg')}
      style={s.bgImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.keyboardView}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Logo */}
          <View style={s.logoContainer}>
            <Image
              source={require('../../assets/volpe_logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
          </View>

          {/* Elevated White Card */}
          <View style={s.card}>
            {/* STEP 1: ROLE SELECTION (Shown when app loads / no role is selected) */}
            {!selectedRole ? (
              <View>
                <Text style={s.title}>Sign in</Text>
                <Text style={s.subtitle}>
                  Select your role to access your school portal
                </Text>

                {error ? (
                  <View style={s.errorBox}>
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={s.roleCardsContainer}>
                  {visibleRoles.map((r) => (
                    <Pressable
                      key={r.role}
                      onPress={() => pickRole(r.role)}
                      style={({ pressed }) => [
                        s.roleCard,
                        pressed && s.roleCardPressed,
                      ]}
                      android_ripple={{ color: '#E2E8F0' }}
                    >
                      <View
                        style={[
                          s.roleBadgeCircle,
                          {
                            backgroundColor: r.bgLight,
                            borderColor: r.borderLight,
                          },
                        ]}
                      >
                        <Text style={s.roleBadgeEmoji}>{r.badge}</Text>
                      </View>
                      <View style={s.roleCardInfo}>
                        <Text style={s.roleCardTitle}>{r.label}</Text>
                        <Text style={s.roleCardDesc}>{r.description}</Text>
                      </View>
                      <View style={s.roleArrowContainer}>
                        <Text style={[s.roleArrowText, { color: r.color }]}>›</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>

                <View style={s.roleHintBox}>
                  <Text style={s.roleHintText}>
                    👉 Tap your role above to enter your email and password.
                  </Text>
                </View>
              </View>
            ) : (
              /* STEP 2: CREDENTIAL ENTRY (Shown only after a role is selected) */
              <View>
                {/* Active Role Header with Quick Switcher */}
                <View style={s.activeRoleHeader}>
                  <View
                    style={[
                      s.activeRoleBadge,
                      {
                        backgroundColor: activeRoleOption?.bgLight || '#EBF2FF',
                        borderColor: activeRoleOption?.borderLight || '#BFD7FE',
                      },
                    ]}
                  >
                    <Text style={s.activeRoleBadgeEmoji}>
                      {activeRoleOption?.badge}
                    </Text>
                    <Text
                      style={[
                        s.activeRoleBadgeText,
                        { color: activeRoleOption?.color || '#1E6BFF' },
                      ]}
                    >
                      {activeRoleOption?.label} Portal
                    </Text>
                  </View>

                  <Pressable
                    onPress={handleClearRole}
                    hitSlop={8}
                    style={s.switchRoleBtn}
                  >
                    <Text style={s.switchRoleBtnText}>Change Role</Text>
                  </Pressable>
                </View>

                <Text style={s.formHeading}>
                  Enter credentials to sign in
                </Text>

                {/* Error Message */}
                {error ? (
                  <View style={s.errorBox}>
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <View style={s.inputContainer}>
                  <Text style={s.inputLabel}>Email Address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor="#94A3B8"
                    style={s.input}
                  />
                </View>

                {/* Password Input with Show/Hide toggle */}
                <View style={s.inputContainer}>
                  <Text style={s.inputLabel}>Password</Text>
                  <View style={s.passwordWrapper}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      style={[s.input, { paddingRight: 64, marginBottom: 0 }]}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={s.showToggle}
                      hitSlop={8}
                    >
                      <Text style={s.showToggleText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Submit Action: Full-width modern Sign In button */}
                <View style={s.submitActionContainer}>
                  <Pressable
                    onPress={submit}
                    disabled={loading}
                    style={({ pressed }) => [
                      s.signInButton,
                      loading && s.signInButtonDisabled,
                      pressed && s.signInButtonPressed,
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={s.signInButtonText}>
                        Sign In as {activeRoleOption?.label || 'User'}
                      </Text>
                    )}
                  </Pressable>
                </View>

                {/* Switch back link */}
                <Pressable
                  onPress={handleClearRole}
                  hitSlop={8}
                  style={s.backToRolesLink}
                >
                  <Text style={s.backToRolesText}>← Choose another role</Text>
                </Pressable>
              </View>
            )}

            {/* Institution Web Info */}
            <View style={s.adminInfoBox}>
              <Text style={s.adminInfoText}>
                🌐 Institution administration & setup are operated on the Web
                Portal. Sign in here to access your assigned school data.
              </Text>
            </View>
          </View>

          {/* Footer Navigation */}
          <View style={s.footer}>
            <Text style={s.footerLanguage}>English (United States)</Text>
            <View style={s.footerLinks}>
              <Text style={s.footerLinkText}>Help</Text>
              <Text style={s.footerLinkText}>Privacy</Text>
              <Text style={s.footerLinkText}>Terms</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logo: {
    width: 140,
    height: 72,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 3,
    marginBottom: 16,
    lineHeight: 20,
  },

  /* Role Selection Cards */
  roleCardsContainer: {
    gap: 10,
    marginBottom: 14,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  roleCardPressed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#1E6BFF',
    transform: [{ scale: 0.99 }],
  },
  roleBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleBadgeEmoji: {
    fontSize: 22,
  },
  roleCardInfo: {
    flex: 1,
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  roleCardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  roleArrowContainer: {
    paddingLeft: 8,
  },
  roleArrowText: {
    fontSize: 24,
    fontWeight: '600',
  },
  roleHintBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  roleHintText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },

  /* Active Role Header */
  activeRoleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activeRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: VolpeTheme.radius.pill,
    borderWidth: 1,
    gap: 6,
  },
  activeRoleBadgeEmoji: {
    fontSize: 16,
  },
  activeRoleBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchRoleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  switchRoleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E6BFF',
  },

  /* Role Switch Pills */
  rolePillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 2,
  },
  rolePill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: VolpeTheme.radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rolePillSelected: {
    backgroundColor: '#DCEBFF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  rolePillUnselected: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rolePillTextSelected: {
    color: '#0066F5',
    fontWeight: '700',
  },
  rolePillTextUnselected: {
    color: '#334155',
  },

  formHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },

  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },

  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  passwordWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  showToggle: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  showToggleText: {
    color: '#0066F5',
    fontSize: 14,
    fontWeight: '600',
  },

  submitActionContainer: {
    marginTop: 6,
    marginBottom: 10,
  },
  signInButton: {
    backgroundColor: '#0066F5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  backToRolesLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToRolesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 6,
  },
  footerLanguage: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  footerLinkText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  adminInfoBox: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adminInfoText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
});
