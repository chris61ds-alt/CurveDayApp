import React from 'react';
import { View } from 'react-native';
import { CATEGORY_ICON_MAP } from './icons/CategoryIcons';

interface Props {
  // Pass the full substance object OR separate icon+color
  substance?: { icon?: string; color: string; category?: string };
  icon?: string;
  color?: string;
  size?: number;
}

export function SubIcon({ substance, icon: iconProp, color: colorProp, size = 36 }: Props) {
  const color    = substance?.color ?? colorProp ?? '#38bdf8';
  const category = substance?.category;

  // Choose SVG category illustration if available
  const IconComponent = category ? CATEGORY_ICON_MAP[category] : undefined;
  const innerSize = Math.round(size * 0.6);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,          // rounded square, not circle
        backgroundColor: `${color}1a`,
        borderWidth: 1.5,
        borderColor: `${color}35`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {IconComponent ? (
        <IconComponent color={color} s={innerSize} />
      ) : (
        // Fallback: generic pill shape for unknown categories
        <View
          style={{
            width: innerSize * 0.7,
            height: innerSize * 0.38,
            borderRadius: innerSize * 0.2,
            backgroundColor: `${color}40`,
            borderWidth: 1.2,
            borderColor: `${color}80`,
          }}
        />
      )}
    </View>
  );
}
