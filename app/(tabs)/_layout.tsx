import { Tabs } from 'expo-router';
import { Text, View, Platform } from 'react-native';
import { IconChart, IconPill, IconFlask, IconSliders } from '../../src/components/icons/TabIcons';
import { useThemeStore } from '../../src/store/themeStore';

function TabIcon({
  Icon, label, focused,
}: {
  Icon: React.ComponentType<{ focused: boolean; size?: number }>;
  label: string;
  focused: boolean;
}) {
  const { colors: C } = useThemeStore();
  return (
    <View style={{ alignItems: 'center', gap: 3, paddingTop: 4 }}>
      <Icon focused={focused} size={26} />
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
            <TabIcon Icon={IconChart} label="Tageskurve" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="intakes"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={IconPill} label="Einnahmen" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="substances"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={IconFlask} label="Substanzen" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={IconSliders} label="Einstellungen" focused={focused} />
          ),
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
