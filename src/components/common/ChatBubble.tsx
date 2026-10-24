import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { VolpeTheme } from '../../theme/theme';

/**
 * Shared chat bubble — replaces 4 duplicated bubble style sets:
 * Parent (chatBubble/userBubble/botBubble), ChatModule (bubble/me/them),
 * Student (msgBubble/msgMe/msgTeacher), Teacher (chatBubble/Me/Other).
 */
export function ChatBubble({
  isMe,
  senderName,
  text,
  time,
  style,
}: {
  isMe: boolean;
  senderName?: string;
  text: string;
  time?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.bubble, isMe ? s.me : s.them, style]}>
      {!isMe && senderName ? <Text style={s.senderName}>{senderName}</Text> : null}
      <Text style={isMe ? s.meText : s.themText}>{text}</Text>
      {time ? <Text style={[s.time, isMe ? s.timeMe : s.timeThem]}>{time}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
    ...VolpeTheme.shadows.card,
  },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: VolpeTheme.colors.primary,
    borderBottomRightRadius: 4,
  },
  them: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.border,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '800',
    color: VolpeTheme.colors.primary,
    marginBottom: 4,
  },
  meText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  themText: { color: VolpeTheme.colors.textPrimary, fontSize: 14, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  timeMe: { color: 'rgba(255,255,255,0.75)' },
  timeThem: { color: VolpeTheme.colors.textLight },
});
