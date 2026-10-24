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
  RefreshCw,
} from 'lucide-react-native';

export function StudentTransportTab() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleCallOffice = () => {
    Linking.openURL('tel:9876543210').catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER CARD (1:1 Web Screenshot Match)            */}
      {/* ======================================================== */}
      <View style={styles.headerCard}>
        <View style={styles.iconBox}>
          <MapPin size={20} color="#6366F1" />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Transport Routes & GPS Tracking</Text>
          <Text style={styles.headerSubtitle}>
            No transport routes have been created yet. Add a bus route before starting GPS tracking.
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. FLEET TRACKING STANDBY CONTAINER                      */}
      {/* ======================================================== */}
      <View style={styles.standbyCard}>
        <View style={styles.illustrationBox}>
          <View style={styles.busIconCircle}>
            <Bus size={36} color="#6366F1" />
          </View>
          <Text style={styles.standbyTitle}>Fleet GPS On Standby</Text>
          <Text style={styles.standbySubtitle}>
            Vehicle telematics, bus stops, and real-time live map coordinates will activate here once
            your route is assigned by the school transport department.
          </Text>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconWrap}>
              <Clock size={14} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureLabel}>ETA Broadcasts</Text>
              <Text style={styles.featureSub}>Live morning & drop alerts</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconWrap}>
              <ShieldCheck size={14} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureLabel}>Campus Safety</Text>
              <Text style={styles.featureSub}>Verified drivers & attendants</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.refreshBtn}
            onPress={handleRefresh}
          >
            <RefreshCw
              size={13}
              color="#475569"
              style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
            />
            <Text style={styles.refreshBtnText}>Check Route Status</Text>
          </Pressable>

          <Pressable
            style={styles.helpdeskBtn}
            onPress={handleCallOffice}
          >
            <PhoneCall size={13} color="#FFFFFF" />
            <Text style={styles.helpdeskBtnText}>Transport Office</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  // 1. Header Card (1:1 with Screenshot)
  headerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginTop: 1,
  },
  headerTextWrap: {
    flex: 1,
    gap: 3,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },

  // 2. Standby Card
  standbyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    gap: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  illustrationBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  busIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  standbyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  standbySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  featureSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  refreshBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  refreshBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  helpdeskBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  helpdeskBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
