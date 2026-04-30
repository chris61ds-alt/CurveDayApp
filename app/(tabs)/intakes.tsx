import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIntakeStore } from '../../src/store/intakeStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useNow } from '../../src/utils/useNow';
import { isActive, getRemainingTime, fmtHour } from '../../src/utils/pkHelpers';
import { getSubstance } from '../../src/data/substanceDB';
import { getSubstanceName } from '../../src/utils/regionUtils';
import type { Region } from '../../src/utils/regionUtils';
import { SubIcon } from '../../src/components/SubIcon';
import { AddIntakeModal } from '../../src/components/AddIntakeModal';
import { useT } from '../../src/i18n';

export default function IntakesScreen() {
  const { intakes, removeIntake, setSelectedId } = useIntakeStore();
  const { colors: C } = useThemeStore();
  const { prefs } = useOnboardingStore();
  const region: Region = (prefs.profile?.region ?? 'DE') as Region;
  const now = useNow();
  const t = useT();
  const [modalVisible, setModalVisible] = useState(false);

  const active   = intakes.filter(i => isActive(i, now));
  const inactive = intakes.filter(i => !isActive(i, now));

  function handleDelete(id: string, name: string) {
    Alert.alert(
      t.intakeDeleteTitle,
      t.intakeDeleteMsg(name),
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: () => removeIntake(id) },
      ]
    );
  }

  function renderItem({ item }: { item: typeof intakes[0] }) {
    const sub = getSubstance(item.substanceId);
    if (!sub) return null;
    const itemActive  = isActive(item, now);
    const remaining   = getRemainingTime(item, now);
    const peak        = fmtHour(item.timeH + sub.pk.tmaxHours);
    const subName     = getSubstanceName(sub, region);

    return (
      <TouchableOpacity
        style={[s.row, { backgroundColor: C.bg2, borderColor: C.border2 },
          itemActive && { borderColor: `${C.accent}25`, backgroundColor: C.surfaceHigh }]}
        onPress={() => setSelectedId(item.substanceId)}
        onLongPress={() => handleDelete(item.id, subName)}
        activeOpacity={0.75}
      >
        <SubIcon substance={sub} size={44} />

        <View style={s.rowBody}>
          <View style={s.rowTop}>
            <Text style={[s.rowName, { color: C.text }]}>{subName}</Text>
            {itemActive && (
              <View style={[s.activeBadge, { backgroundColor: C.accentBg }]}>
                <Text style={[s.activeBadgeText, { color: C.accent }]}>{t.intakeActive}</Text>
              </View>
            )}
            {sub.prescription && (
              <View style={[s.rxBadge, { backgroundColor: C.dangerBg }]}>
                <Text style={[s.rxText, { color: C.danger }]}>Rx</Text>
              </View>
            )}
          </View>
          <Text style={[s.rowMeta, { color: C.textMuted }]}>
            {fmtHour(item.timeH)}{t.timeUnit} · {item.doseLabel} · {t.intakePeakAt} {peak}
          </Text>
          <Text style={[s.rowRemaining, { color: itemActive ? C.accent : C.textMuted }]}>{remaining}</Text>
        </View>

        <TouchableOpacity
          onPress={() => handleDelete(item.id, subName)}
          style={s.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[s.deleteIcon, { color: C.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Header */}
      <View style={[s.header, { borderBottomColor: C.border2 }]}>
        <View>
          <Text style={[s.headerTitle, { color: C.text }]}>{t.intakesTitle}</Text>
          <Text style={[s.headerSub, { color: C.textMuted }]}>{t.intakesCount(intakes.length)}</Text>
        </View>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: C.accent }]} onPress={() => setModalVisible(true)}>
          <Text style={s.addBtnText}>+ {t.add}</Text>
        </TouchableOpacity>
      </View>

      {intakes.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={[s.emptyTitle, { color: C.text }]}>{t.intakesEmptyTitle}</Text>
          <Text style={[s.emptySub, { color: C.textMuted }]}>{t.intakesEmptyDesc}</Text>
          <TouchableOpacity style={[s.emptyBtn, { backgroundColor: C.accent }]} onPress={() => setModalVisible(true)}>
            <Text style={s.emptyBtnText}>{t.intakesAddBtn}</Text>
          </TouchableOpacity>
          <View style={s.emptyFeatures}>
            {[
              { icon: '⏰', text: t.homeEmptyHint1 },
              { icon: '🔔', text: t.homeEmptyHint2 },
              { icon: '📊', text: t.homeEmptyHint3 },
            ].map((f, i) => (
              <View key={i} style={[s.emptyFeatureRow, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
                <Text style={s.emptyFeatureIcon}>{f.icon}</Text>
                <Text style={[s.emptyFeatureText, { color: C.textSub }]}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={[
            ...(active.length   ? [{ type: 'header', label: `${t.intakesActiveSection} (${active.length})`, id: 'h1' }] : []),
            ...active.map(i => ({ ...i, type: 'item' })),
            ...(inactive.length ? [{ type: 'header', label: `${t.intakesOtherSection} (${inactive.length})`, id: 'h2' }] : []),
            ...inactive.map(i => ({ ...i, type: 'item' })),
          ]}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }: any) => {
            if (item.type === 'header') {
              return <Text style={[s.sectionHeader, { color: C.textMuted }]}>{item.label}</Text>;
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSub:   { fontSize: 12, marginTop: 2 },
  addBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText:  { color: '#000', fontWeight: '700', fontSize: 13 },

  list: { padding: 16, paddingBottom: 32 },

  sectionHeader: {
    fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 16, marginBottom: 8, marginLeft: 4,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 12, marginBottom: 10,
    borderWidth: 1,
  },
  rowBody:      { flex: 1, marginLeft: 12 },
  rowTop:       { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  rowName:      { fontSize: 15, fontWeight: '700', marginRight: 8 },
  rowMeta:      { fontSize: 12, marginBottom: 2 },
  rowRemaining: { fontSize: 12, fontWeight: '600' },

  activeBadge:     { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginRight: 6 },
  activeBadgeText: { fontSize: 10, fontWeight: '700' },
  rxBadge:         { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  rxText:          { fontSize: 10, fontWeight: '700' },

  deleteBtn:  { padding: 6 },
  deleteIcon: { fontSize: 14 },

  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon:    { fontSize: 52, marginBottom: 20 },
  emptyTitle:   { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySub:     { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  emptyBtn:     { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24, alignSelf: 'stretch', alignItems: 'center', marginBottom: 32 },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
  emptyFeatures:{ alignSelf: 'stretch', gap: 12 },
  emptyFeatureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 12, padding: 12, borderWidth: 1,
  },
  emptyFeatureIcon: { fontSize: 20 },
  emptyFeatureText: { fontSize: 14 },
});
