import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { useIntakeStore } from '../../src/store/intakeStore';
import { useNow } from '../../src/utils/useNow';
import { isActive, getRemainingTime, fmtHour } from '../../src/utils/pkHelpers';
import { getSubstance } from '../../src/data/substanceDB';
import SubIcon from '../../src/components/SubIcon';
import AddIntakeModal from '../../src/components/AddIntakeModal';

export default function IntakesScreen() {
  const { intakes, removeIntake, setSelectedId } = useIntakeStore();
  const now = useNow();
  const [modalVisible, setModalVisible] = useState(false);

  const active   = intakes.filter(i => isActive(i, now));
  const inactive = intakes.filter(i => !isActive(i, now));

  function handleDelete(id: string, name: string) {
    Alert.alert(
      'Einnahme entfernen',
      `„${name}" aus der Liste löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: () => removeIntake(id) },
      ]
    );
  }

  function renderItem({ item }: { item: typeof intakes[0] }) {
    const sub = getSubstance(item.substanceId);
    if (!sub) return null;
    const active = isActive(item, now);
    const remaining = getRemainingTime(item, now);
    const peak = fmtHour(item.timeH + sub.pk.tmaxHours);

    return (
      <TouchableOpacity
        style={[s.row, active && s.rowActive]}
        onPress={() => setSelectedId(item.substanceId)}
        onLongPress={() => handleDelete(item.id, sub.name)}
        activeOpacity={0.75}
      >
        <SubIcon substance={sub} size={44} />

        <View style={s.rowBody}>
          <View style={s.rowTop}>
            <Text style={s.rowName}>{sub.name}</Text>
            {active && <View style={s.activeBadge}><Text style={s.activeBadgeText}>Aktiv</Text></View>}
            {sub.prescription && <View style={s.rxBadge}><Text style={s.rxText}>Rx</Text></View>}
          </View>
          <Text style={s.rowMeta}>
            {fmtHour(item.timeH)} Uhr · {item.doseLabel} · Peak {peak}
          </Text>
          <Text style={[s.rowRemaining, !active && s.rowExpired]}>{remaining}</Text>
        </View>

        <TouchableOpacity onPress={() => handleDelete(item.id, sub.name)} style={s.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#060b13" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Einnahmen</Text>
          <Text style={s.headerSub}>{intakes.length} Einträge heute</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={s.addBtnText}>+ Neu</Text>
        </TouchableOpacity>
      </View>

      {intakes.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyTitle}>Noch keine Einnahmen</Text>
          <Text style={s.emptySub}>Hier siehst du alle deine heutigen{'\n'}Einnahmen auf einen Blick.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => setModalVisible(true)}>
            <Text style={s.emptyBtnText}>+ Erste Einnahme hinzufügen</Text>
          </TouchableOpacity>
          <View style={s.emptyFeatures}>
            {[
              { icon: '⏰', text: 'Zeiten & Dosierungen tracken' },
              { icon: '🔔', text: 'Erinnerungen setzen' },
              { icon: '📊', text: 'Wirkkurven visualisieren' },
            ].map((f, i) => (
              <View key={i} style={s.emptyFeatureRow}>
                <Text style={s.emptyFeatureIcon}>{f.icon}</Text>
                <Text style={s.emptyFeatureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={[
            ...(active.length   ? [{ type: 'header', label: `Aktiv jetzt (${active.length})`,   id: 'h1' }] : []),
            ...active.map(i => ({ ...i, type: 'item' })),
            ...(inactive.length ? [{ type: 'header', label: `Abgelaufen (${inactive.length})`, id: 'h2' }] : []),
            ...inactive.map(i => ({ ...i, type: 'item' })),
          ]}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }: any) => {
            if (item.type === 'header') {
              return <Text style={s.sectionHeader}>{item.label}</Text>;
            }
            return renderItem({ item });
          }}
        />
      )}

      <AddIntakeModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060b13' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#0d1a2a',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub:   { fontSize: 12, color: '#4a5a70', marginTop: 2 },
  addBtn: {
    backgroundColor: '#38bdf8', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#000', fontWeight: '700', fontSize: 13 },

  list: { padding: 16, paddingBottom: 32 },

  sectionHeader: {
    fontSize: 11, fontWeight: '700', color: '#4a5a70',
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 16, marginBottom: 8, marginLeft: 4,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1a2a', borderRadius: 14,
    padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#132033',
  },
  rowActive: {
    borderColor: '#38bdf820',
    backgroundColor: '#0a1e30',
  },
  rowBody:  { flex: 1, marginLeft: 12 },
  rowTop:   { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  rowName:  { fontSize: 15, fontWeight: '700', color: '#e2f0ff', marginRight: 8 },
  rowMeta:  { fontSize: 12, color: '#4a5a70', marginBottom: 2 },
  rowRemaining: { fontSize: 12, color: '#38bdf8', fontWeight: '600' },
  rowExpired:   { color: '#4a5a70' },

  activeBadge: {
    backgroundColor: '#38bdf820', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2, marginRight: 6,
  },
  activeBadgeText: { fontSize: 10, color: '#38bdf8', fontWeight: '700' },
  rxBadge: {
    backgroundColor: '#f8714320', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  rxText: { fontSize: 10, color: '#f87143', fontWeight: '700' },

  deleteBtn:  { padding: 6 },
  deleteIcon: { fontSize: 14, color: '#4a5a70' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon:  { fontSize: 52, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
  emptySub:   { fontSize: 14, color: '#4a5a70', textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  emptyBtn: {
    backgroundColor: '#38bdf8', borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 24,
    alignSelf: 'stretch', alignItems: 'center', marginBottom: 32,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
  emptyFeatures: { alignSelf: 'stretch', gap: 12 },
  emptyFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0d1a2a', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#132033',
  },
  emptyFeatureIcon: { fontSize: 20 },
  emptyFeatureText: { fontSize: 14, color: '#7a9ab5' },
});
