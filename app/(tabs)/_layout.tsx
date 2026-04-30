import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, nameOutline, label, focused }: {
  name: IoniconName; nameOutline: IoniconName; label: string; focused: boolean;
}) {
  const { colors: C } = useThemeStore();
  return (
    <View style={{ alignItems: 'center', gap: 3, paddingTop: 4 }}>
      <Ionicons
        name={focused ? name : nameOutline}
        size={23}
        color={focused ? C.accent : C.textDim}
      />
      <Text style={{
        fontSize: 10,
        color: focused ? C.accent : C.textDim,
        fontWeight: focused ? '700' : '400',
        letterSpacing: 0.2,
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { colors: C } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.isDark ? '#07101d' : C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 66,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="analytics" nameOutline="analytics-outline" label="Tageskurve" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="intakes"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="medkit" nameOutline="medkit-outline" label="Einnahmen" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="substances"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="flask" nameOutline="flask-outline" label="Substanzen" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings" nameOutline="settings-outline" label="Einstellungen" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="protocols" options={{ href: null }} />
    </Tabs>
  );
}
