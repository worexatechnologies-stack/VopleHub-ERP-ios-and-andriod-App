import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Linking,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { X, ExternalLink, Download, FileText, File, Image as ImageIcon } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export interface AttachmentViewerProps {
  visible: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  type?: 'image' | 'file';
  contentType?: string;
  fileSize?: number;
}

export function AttachmentViewerModal({
  visible,
  onClose,
  url,
  title,
  type,
  contentType,
  fileSize,
}: AttachmentViewerProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!visible || !url) return null;

  const isImage =
    type === 'image' ||
    contentType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(title || '');

  const ext = (title || '').split('.').pop()?.toUpperCase() || 'FILE';
  const sizeStr = fileSize && fileSize > 0 ? `${Math.round(fileSize / 1024)} KB` : '';

  const handleOpenExternal = async () => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (err: any) {
      Alert.alert(
        'Unable to Open',
        'Could not open this file automatically. Please verify that a compatible app or browser is installed.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        {/* Header Bar */}
        <View style={s.header}>
          <View style={s.headerTitleWrap}>
            <Text style={s.headerTitle} numberOfLines={1}>
              {title || (isImage ? 'Photo Viewer' : 'Document Viewer')}
            </Text>
            {sizeStr ? <Text style={s.headerMeta}>{sizeStr} • {ext}</Text> : null}
          </View>
          <Pressable onPress={onClose} hitSlop={12} style={s.closeBtn}>
            <X size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Content Body */}
        <View style={s.body}>
          {isImage ? (
            <View style={s.imageContainer}>
              {imageLoading && !imageError && (
                <View style={s.loaderWrap}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={s.loadingText}>Loading image...</Text>
                </View>
              )}
              {imageError ? (
                <View style={s.errorWrap}>
                  <ImageIcon size={48} color="#EF4444" />
                  <Text style={s.errorText}>Unable to load image preview</Text>
                  <Pressable onPress={handleOpenExternal} style={s.retryBtn}>
                    <Text style={s.retryBtnText}>Open in Browser</Text>
                  </Pressable>
                </View>
              ) : (
                <Image
                  source={{ uri: url }}
                  style={s.fullImage}
                  resizeMode="contain"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
              )}
            </View>
          ) : (
            <View style={s.docContainer}>
              <View style={s.docIconWrap}>
                <FileText size={56} color="#1E6BFF" />
                <View style={s.docBadge}>
                  <Text style={s.docBadgeText}>{ext}</Text>
                </View>
              </View>

              <Text style={s.docTitle} numberOfLines={2}>
                {title || 'Document File'}
              </Text>
              <Text style={s.docMetaText}>
                {sizeStr ? `${sizeStr} • ` : ''}{ext} Document
              </Text>

              <Pressable
                onPress={handleOpenExternal}
                style={({ pressed }) => [s.openDocBtn, pressed && s.openDocBtnPressed]}
              >
                <ExternalLink size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={s.openDocBtnText}>Open Document</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Bottom Actions Bar */}
        <View style={s.footer}>
          <Pressable
            onPress={handleOpenExternal}
            style={({ pressed }) => [s.footerBtn, pressed && s.footerBtnPressed]}
          >
            <Download size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={s.footerBtnText}>Open / Download</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height * 0.72,
  },
  loaderWrap: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  errorWrap: {
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: '#1E6BFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  docContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: Math.min(width - 48, 360),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  docIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  docBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#1E6BFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  docBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  docMetaText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  openDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E6BFF',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
  },
  openDocBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  openDocBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 20,
  },
  footerBtnPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  footerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
