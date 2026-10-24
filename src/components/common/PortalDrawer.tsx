import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { PortalSidebar, PortalNavItem } from './PortalSidebar';

const DRAWER_WIDTH = 295;

interface PortalDrawerProps<T extends string> {
  isOpen: boolean;
  onClose: () => void;
  items: PortalNavItem<T>[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
  userRole: string;
}

export function PortalDrawer<T extends string>({
  isOpen,
  onClose,
  items,
  activeTab,
  onSelectTab,
  userRole,
}: PortalDrawerProps<T>) {
  const [mounted, setMounted] = useState(isOpen);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
      });
    }
  }, [isOpen, mounted, slideAnim, fadeAnim]);

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Animated backdrop with tap to dismiss */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Smooth horizontal slide-in drawer sheet from left */}
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <PortalSidebar
            items={items}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              onSelectTab(tab);
              onClose();
            }}
            userRole={userRole}
            onClose={onClose}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#0F172A',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 24,
  },
});
