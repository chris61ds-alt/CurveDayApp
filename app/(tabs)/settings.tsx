import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
export default function SettingsScreen() {
  return (
    <SafeAreaView style={s.safe}><View style={s.center}>
      <Text style={s.icon}>⚙️</Text>
      <Text style={s.title}>Einstellungen</Text>
      <Text style={s.sub}>Coming soon</Text>
    </View></SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060b13' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 22, color: '#fff', fontWeight: '700', marginBottom: 8 },
  sub: { fontSize: 13, color: '#4a5a70' },
});
