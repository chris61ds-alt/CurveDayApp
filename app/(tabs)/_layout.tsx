import { Tabs } from 'expo-router';
import { Text, View, Platform } from 'react-native';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2, paddingTop: 4 }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{
        fontSize: 10,
        color: focused ? '#38bdf8' : '#3a5570',
        fontWeight: focused ? '700' : '400',
        letterSpacing: 0.2,
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#07101d',
          borderTopColor: '#0f1e30',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 : 64,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📈" label="Tageskurve" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="intakes"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💊" label="Einnahmen" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="substances"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🧪" label="Substanzen" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Einstellungen" focused={focused} />,
        }}
      />
      {/* Protokolle ausgeblendet — kommt in v2 */}
      <Tabs.Screen
        name="protocols"
        options={{ href: null }}
      />
    </Tabs>
  );
}
