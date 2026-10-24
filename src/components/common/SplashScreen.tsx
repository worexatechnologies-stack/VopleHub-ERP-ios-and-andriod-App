import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VolpeTheme } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

export function SplashScreen() {
  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        {/* Soft decorative cloud shapes */}
        <View style={s.topCloud} />
        <View style={s.bottomCloud} />

        {/* Top-right motto */}
        <View style={s.topScriptContainer}>
          <Text style={s.scriptText}>Play</Text>
          <Text style={s.scriptText}>Learn</Text>
          <Text style={s.scriptText}>Grow</Text>
          <Text style={s.scriptText}>Safe ♡</Text>
        </View>

        {/* Center Mascot & Brand */}
        <View style={s.centerContent}>
          <Image
            source={require('../../assets/volpe_logo.png')}
            style={s.mascot}
            resizeMode="contain"
          />

          <Text style={s.tagline}>
            A Safer, Brighter Tomorrow{'\n'}for Every Child
          </Text>

          <View style={s.accentBar} />

          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={VolpeTheme.colors.primary} />
            <Text style={s.loadingText}>Loading portal...</Text>
          </View>
        </View>

        {/* Bottom Footer Pillars */}
        <View style={s.footerContainer}>
          <Text style={s.footerPillars}>
            SAFE  •  LEARN  •  PLAY  •  GROW
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  topCloud: {
    position: 'absolute',
    top: -width * 0.4,
    left: -width * 0.3,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: '#E0F2FE',
    opacity: 0.6,
  },
  bottomCloud: {
    position: 'absolute',
    bottom: -width * 0.5,
    right: -width * 0.2,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: (width * 1.1) / 2,
    backgroundColor: '#E0F2FE',
    opacity: 0.5,
  },
  topScriptContainer: {
    alignSelf: 'flex-end',
    paddingTop: 16,
    paddingRight: 28,
  },
  scriptText: {
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#38BDF8',
    textAlign: 'right',
    lineHeight: 22,
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -20,
  },
  mascot: {
    width: width * 0.65,
    height: width * 0.55,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '800',
    color: '#003366',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  accentBar: {
    width: 60,
    height: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: VolpeTheme.colors.textMuted,
    fontWeight: '500',
  },
  footerContainer: {
    paddingBottom: 24,
  },
  footerPillars: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 2,
  },
});
