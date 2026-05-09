import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { useChatStore } from '../stores/chatStore';
import { Storage } from '../services/storage';
import type { ChatConfig } from '../types';

export default function SettingsScreen() {
  const router = useRouter();
  const { config, setConfig, conversations } = useChatStore();

  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBaseUrl(config.baseUrl);
    setApiKey(config.apiKey);
    setModel(config.model);
  }, [config]);

  const handleSave = async () => {
    if (!baseUrl.trim()) {
      Alert.alert('Validation', 'Server URL is required');
      return;
    }

    setIsSaving(true);
    try {
      const newConfig: ChatConfig = {
        baseUrl: baseUrl.trim().replace(/\/+$/, ''),
        apiKey: apiKey.trim(),
        model: model.trim() || 'hermes',
      };

      setConfig(newConfig);
      await Storage.saveConfig(newConfig);

      Alert.alert('Saved', 'Settings saved successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConversations = () => {
    Alert.alert(
      'Reset all conversations',
      'This will delete all your conversations. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            useChatStore.getState().setConversations([]);
            await Storage.saveConversations([]);
            Alert.alert('Done', 'All conversations deleted');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Server section */}
        <Text style={styles.sectionTitle}>Connection</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Server URL</Text>
          <TextInput
            style={styles.input}
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="https://hermes.sharathchenna.top"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text style={styles.hint}>
            The Hermes Agent API server URL
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Optional API key"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <Text style={styles.hint}>
            Bearer token from API_SERVER_KEY config
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="hermes"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            Model name sent to the API (default: hermes)
          </Text>
        </View>

        {/* Data section */}
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Conversations</Text>
              <Text style={styles.value}>
                {conversations.length} conversation{(conversations.length || 0) > 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={handleResetConversations}
            >
              <Text style={styles.dangerBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info section */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App</Text>
            <Text style={styles.infoValue}>Hermes Research</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>API</Text>
            <Text style={styles.infoValue}>OpenAI-compatible</Text>
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? 'Saving…' : 'Save Settings'}
          </Text>
        </TouchableOpacity>

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  value: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  hint: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerBtnText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
