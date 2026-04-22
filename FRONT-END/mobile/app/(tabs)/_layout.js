import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ focused, label, emoji }) {
  return (
    <View style={s.tab}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={[s.label, focused && s.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: s.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Início" emoji="🏠" />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Mapa" emoji="🗺️" />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Perfil" emoji="👤" />
          ),
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: '#14141C',
    borderTopColor: '#1E1E28',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
  },
  tab: { alignItems: 'center', gap: 3, paddingTop: 8 },
  emoji: { fontSize: 20 },
  label: { fontSize: 10, color: '#555', fontWeight: '500' },
  labelActive: { color: '#FF6B2B' },
});