import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle, TextStyle, Pressable } from 'react-native';
import { getInitials } from '../../utils/formatters';

interface InitialsAvatarProps {
  name: string | undefined | null;
  size?: number;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  imageUri?: string | null;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
}

const BG_PALETTE = ['#4F46E5', '#2563EB', '#0D9488', '#059669', '#D97706', '#E11D48', '#7C3AED'];

function pickColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BG_PALETTE.length;
  return BG_PALETTE[index];
}

export function InitialsAvatar({
  name,
  size = 38,
  bgColor,
  textColor = '#FFFFFF',
  fontSize,
  imageUri,
  style,
  textStyle,
  onPress,
}: InitialsAvatarProps) {
  const resolvedBg = bgColor || (name ? pickColorFromName(name) : '#4F46E5');
  const resolvedFontSize = fontSize || Math.max(11, Math.round(size * 0.38));
  const initials = getInitials(name);

  const content = imageUri ? (
    <Image
      source={{ uri: imageUri }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style as any,
      ]}
      resizeMode="cover"
    />
  ) : (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: resolvedBg,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: resolvedFontSize,
          },
          textStyle,
        ]}
      >
        {initials}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={6}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
