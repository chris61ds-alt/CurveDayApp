import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  icon: string;
  color: string;
  size?: number;
}

export function SubIcon({ icon, color, size = 32 }: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `${color}18`,
          borderColor: `${color}35`,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.46, lineHeight: size * 0.46 + 2 }}>
        {icon}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
