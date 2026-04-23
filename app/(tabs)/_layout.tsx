import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { DynamicColorIOS } from 'react-native';

const labelColor = DynamicColorIOS({
  dark: '#F5F3F0',
  light: '#1a1208',
});

const tintColor = DynamicColorIOS({
  dark: '#E8C84A',
  light: '#B89A2E',
});

export default function TabLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <NativeTabs
        labelStyle={{ color: labelColor }}
        tintColor={tintColor}
      >
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="chat">
          <Label>Chat</Label>
          <Icon sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }} />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="skills">
          <Label>Skills</Label>
          <Icon sf={{ default: 'square.stack.3d.up', selected: 'square.stack.3d.up.fill' }} />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="memory">
          <Label>Memory</Label>
          <Icon sf={{ default: 'doc.text', selected: 'doc.text.fill' }} />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings">
          <Label>You</Label>
          <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
