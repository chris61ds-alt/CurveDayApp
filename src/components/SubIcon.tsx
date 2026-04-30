import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  substance?: { icon?: string; color: string; category?: string };
  icon?: string;
  color?: string;
  size?: number;
}

// Ionicon name per substance category
const CATEGORY_ICON: Record<string, string> = {
  analgesic:      'pill',
  adhd:           'brain',
  sleep:          'power-sleep',
  stimulant:      'coffee',
  antihistamine:  'leaf',
  cardiovascular: 'heart-pulse',
  antidepressant: 'white-balance-sunny',
  supplement:     'sprout',
  gastro:         'water',
  recreational:   'beer-outline',
};

export function SubIcon({ substance, color: colorProp, size = 36 }: Props) {
  const color    = substance?.color ?? colorProp ?? '#38bdf8';
  const category = substance?.category;
  const iconName = (category && CATEGORY_ICON[category]) ?? 'pill';
  const iconSize = Math.round(size * 0.52);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: `${color}1e`,
        borderWidth: 1.5,
        borderColor: `${color}38`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons name={iconName as any} size={iconSize} color={color} />
    </View>
  );
}
