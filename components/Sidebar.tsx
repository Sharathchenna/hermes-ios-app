import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Colors } from '../constants/theme';
import type { Conversation } from '../types';

interface Props {
  visible: boolean;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function Sidebar({
  visible,
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onClose,
}: Props) {
  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete conversation',
      `Are you sure you want to delete "${title.length > 30 ? title.slice(0, 30) + '…' : title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(id),
        },
      ]
    );
  };

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const grouped = groupByDate(conversations);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>H</Text>
              </View>
              <Text style={styles.title}>Conversations</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* New chat button */}
          <TouchableOpacity style={styles.newChatBtn} onPress={onNewChat}>
            <Text style={styles.newChatIcon}>+</Text>
            <Text style={styles.newChatText}>New conversation</Text>
          </TouchableOpacity>

          {/* List */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(grouped).map(([label, items]) => (
              <View key={label}>
                <Text style={styles.groupLabel}>{label}</Text>
                {items.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    style={[
                      styles.item,
                      conv.id === activeId && styles.itemActive,
                    ]}
                    onPress={() => {
                      onSelect(conv.id);
                      onClose();
                    }}
                    onLongPress={() => handleDelete(conv.id, conv.title)}
                  >
                    <View style={styles.itemContent}>
                      <Text
                        style={[
                          styles.itemTitle,
                          conv.id === activeId && styles.itemTitleActive,
                        ]}
                        numberOfLines={1}
                      >
                        {conv.title}
                      </Text>
                      <Text style={styles.itemDate}>
                        {conv.messages.length} messages
                        {' · '}
                        {formatDate(conv.updatedAt)}
                      </Text>
                    </View>
                    {conv.id === activeId && <View style={styles.activeDot} />}
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {conversations.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start a new chat to begin
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function groupByDate(conversations: Conversation[]): Record<string, Conversation[]> {
  const groups: Record<string, Conversation[]> = {};
  const now = new Date();

  for (const conv of conversations) {
    const date = new Date(conv.updatedAt);
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    let label: string;
    if (days === 0) label = 'Today';
    else if (days === 1) label = 'Yesterday';
    else if (days < 7) label = 'Previous 7 Days';
    else if (days < 30) label = 'Previous 30 Days';
    else label = 'Older';

    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  return groups;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    width: '85%',
    maxWidth: 380,
    backgroundColor: Colors.bg,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 18,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  newChatIcon: {
    fontSize: 22,
    color: Colors.accent,
    fontWeight: '300',
    width: 24,
    textAlign: 'center',
  },
  newChatText: {
    fontSize: 15,
    color: Colors.text,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  itemActive: {
    backgroundColor: Colors.accentDim,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 19,
  },
  itemTitleActive: {
    fontWeight: '600',
    color: Colors.accentLight,
  },
  itemDate: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginLeft: 8,
  },
  empty: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
});
