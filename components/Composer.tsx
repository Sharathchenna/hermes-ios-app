import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import { Colors } from '../constants/theme';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function Composer({ onSend, disabled, placeholder }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, disabled && styles.containerDisabled]}>
        {/* Attachment button */}
        <TouchableOpacity style={styles.attachBtn} disabled={disabled}>
          <View style={styles.plusIcon}>
            <View style={styles.plusH} />
            <View style={styles.plusV} />
          </View>
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder || 'Message Hermes'}
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={4000}
          editable={!disabled}
          returnKeyType="default"
          blurOnSubmit
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
              handleSend();
            }
          }}
        />

        {/* Send button */}
        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          <View style={styles.sendArrow}>
            <View style={styles.sendArrowHead} />
            <View style={styles.sendArrowStem} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    paddingTop: 4,
    backgroundColor: Colors.bg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  attachBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginBottom: 2,
  },
  plusIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusH: {
    position: 'absolute',
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.textSecondary,
  },
  plusV: {
    position: 'absolute',
    width: 2,
    height: 16,
    borderRadius: 1,
    backgroundColor: Colors.textSecondary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxHeight: 120,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
  sendArrow: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendArrowHead: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderLeftColor: 'transparent',
    borderRightWidth: 7,
    borderRightColor: 'transparent',
    borderBottomWidth: 10,
    borderBottomColor: '#FFFFFF',
    transform: [{ rotate: '90deg' }],
    top: -2,
  },
  sendArrowStem: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: '#FFFFFF',
    top: -1,
  },
});
