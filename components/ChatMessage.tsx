import React, { useRef, useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Colors } from '../constants/theme';
import type { Message } from '../types';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';

  const markdownStyles = useMemo(
    () => ({
      body: {
        color: isUser ? '#FFFFFF' : Colors.text,
        fontSize: 16,
        lineHeight: 22,
      },
      heading1: { fontSize: 22, fontWeight: '700' as const, marginBottom: 8, marginTop: 4 },
      heading2: { fontSize: 19, fontWeight: '600' as const, marginBottom: 6, marginTop: 4 },
      heading3: { fontSize: 17, fontWeight: '600' as const, marginBottom: 4 },
      paragraph: { marginVertical: 4 },
      code_inline: {
        backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : Colors.surface,
        color: isUser ? '#FFFFFF' : Colors.accentLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 14,
      },
      code_block: {
        backgroundColor: isUser ? 'rgba(0,0,0,0.2)' : '#1A1A1A',
        padding: 12,
        borderRadius: 8,
        marginVertical: 6,
      },
      fence: {
        backgroundColor: isUser ? 'rgba(0,0,0,0.2)' : '#1A1A1A',
        padding: 12,
        borderRadius: 8,
        marginVertical: 6,
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: isUser ? 'rgba(255,255,255,0.3)' : Colors.accentDim,
        paddingLeft: 10,
        marginVertical: 6,
        opacity: 0.8,
      },
      bullet_list: { marginVertical: 4 },
      ordered_list: { marginVertical: 4 },
      list_item: { marginVertical: 2 },
      link: {
        color: isUser ? 'rgba(255,255,255,0.8)' : Colors.accentLight,
        textDecorationLine: 'underline' as const,
      },
      hr: {
        backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : Colors.border,
        height: 1,
        marginVertical: 10,
      },
      table: {
        borderWidth: 1,
        borderColor: isUser ? 'rgba(255,255,255,0.2)' : Colors.border,
        borderRadius: 8,
        marginVertical: 6,
      },
      thead: {
        backgroundColor: isUser ? 'rgba(0,0,0,0.2)' : Colors.surface,
      },
      th: {
        padding: 8,
        fontWeight: '600',
        borderRightWidth: 1,
        borderColor: isUser ? 'rgba(255,255,255,0.2)' : Colors.border,
      },
      td: {
        padding: 8,
        borderRightWidth: 1,
        borderColor: isUser ? 'rgba(255,255,255,0.2)' : Colors.border,
      },
    }),
    [isUser]
  );

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      {/* Avatar */}
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>H</Text>
        </View>
      )}

      {/* Bubble */}
      <View style={[styles.bubble, isUser && styles.bubbleUser]}>
        {isUser ? (
          <Text style={styles.userText}>{message.content}</Text>
        ) : (
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        )}

        {/* Streaming cursor */}
        {isStreaming && (
          <View style={styles.cursor} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  containerUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bubble: {
    flex: 1,
    maxWidth: '88%',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  cursor: {
    width: 8,
    height: 18,
    backgroundColor: Colors.text,
    borderRadius: 2,
    marginTop: 2,
    opacity: 0.6,
  },
});
