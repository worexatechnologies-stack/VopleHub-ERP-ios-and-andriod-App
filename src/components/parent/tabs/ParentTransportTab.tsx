import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import {
  MapPin,
  Bus,
  PhoneCall,
  Clock,
  ShieldCheck,
  Navigation2,
  RefreshCw,
} from 'lucide-react-native';

export function ParentTransportTab() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleCallHelpdesk = () => {
    Linking.openURL('tel:9876543210').catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER CARD (1:1 Web Screenshot Match)            */}
      {/* ======================================================== */}
      <View style={styles.headerCard}>
        <View style={styles.iconBox}>
          <MapPin size={22} color="#6366F1" />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Transport Routes & GPS Tracking</Text>
          <Text style={styles.headerSubtitle}>
            No transport routes have been created yet. Add a bus route before starting GPS tracking.
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. INFORMATIVE LIVE STATUS & HELPDESK CONTAINER           */}
      {/* ======================================================== */}
      <View style={styles.detailsCard}>
        <View style={styles.emptyIllustrationBox}>
          <View style={styles.busIconCircle}>
            <Bus size={38} color="#6366F1" />
          </View>
          <Text style={styles.emptyTitle}>Fleet Tracking Standby</Text>
          <Text style={styles.emptySubtitle}>
            When the school administration links your child's route, live vehicle telematics, route waypoints, and real-time GPS coordinates will stream here automatically.
          </Text>
        </View>

        {/* Feature Badges Row */}
        <View style={styles.featuresRow}>
          <View style={styles.featurePill}>
            <Navigation2 size={13} color="#2563EB" />
            <Text style={styles.featureText}>Live GPS Telemetry</Text>
          </View>
          <View style={styles.featurePill}>
            <Clock size={13} color="#059669" />
            <Text style={styles.featureText}>ETA Updates</Text>
          </View>
          <View style={styles.featurePill}>
            <ShieldCheck size={13} color="#7C3AED" />
            <Text style={styles.featureText}>Verified Drivers</Text>
          </View>
        </View>

        {/* Transport Helpdesk Contact Banner */}
        <View style={styles.contactBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactBannerTitle}>School Transport Department</Text>
            <Text style={styles.contactBannerSubtitle}>
              Questions regarding bus allocation, routes, or pickup points?
            </Text>
          </View>
          <Pressable style={styles.callBtn} onPress={handleCallHelpdesk}>
            <PhoneCall size={14} color="#FFFFFF" />
            <Text style={styles.callBtnText}>Call Helpdesk</Text>
          </Pressable>
        </View>

        {/* Quick Refresh Status */}
        <Pressable style={styles.refreshBar} onPress={handleRefresh}>
          <RefreshCw size={14} color="#64748B" />
          <Text style={styles.refreshBarText}>
            {refreshing ? 'Checking GPS satellites...' : 'Check GPS Server Status'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  // 1. Header Card (Matching Web Screenshot 1:1)
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },

  // 2. Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  emptyIllustrationBox: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  busIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },

  // Features Row
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },

  // Helpdesk Banner
  contactBanner: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  contactBannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  contactBannerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  callBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Refresh Bar
  refreshBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refreshBarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
