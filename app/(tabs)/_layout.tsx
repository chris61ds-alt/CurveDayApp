import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ fontSize: 9, color: focused ? '#38bdf8' : '#4a5a70', fontWeight: focused ? '700' : '400' }}>
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
          backgroundColor: '#08101c',
          borderTopColor: '#142030',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
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
        name="substances"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🧪" label="Substanzen" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="intakes"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💉" label="Einnahmen" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="protocols"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Protokolle" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Einstellungen" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
