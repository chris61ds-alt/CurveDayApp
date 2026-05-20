import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SUBSTANCES, CATEGORIES } from '../../src/data/substanceDB';
import { useThemeStore } from '../../src/store/themeStore';
import { SubIcon } from '../../src/components/SubIcon';
import { EFFECT_LABELS } from '../../src/utils/pkHelpers';
import { AddIntakeModal } from '../../src/components/AddIntakeModal';

// ── Detail Modal ──────────────────────────────────────────────
function DetailModal({ sub, onClose }: { sub: any; onClose: () => void }) {
  const { colors: C } = useThemeStore();
  if (!sub) return null;
  const cat = CATEGORIES.find((c: any) => c.id === sub.category);
  const effects = Object.entries(sub.effects as Record<string, number>)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

        {/* Header */}
        <View style={[d.header, { borderBottomColor: C.border2 }]}>
          <SubIcon substance={sub} size={52} />
          <View style={d.headerText}>
            <Text style={[d.name, { color: C.text }]}>{sub.name}</Text>
            <Text style={[d.cat, { color: C.textSub }]}>{cat?.icon} {cat?.label}</Text>
            {sub.brandNames?.length > 0 && (
              <Text style={[d.brands, { color: C.textMuted }]}>{sub.brandNames.slice(0, 3).join(' · ')}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={d.closeBtn}>
            <Text style={[d.closeText, { color: C.textMuted }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={d.scroll}>

          {/* Badges */}
          <View style={d.badges}>
            {sub.prescription && (
              <View style={[d.badge, { backgroundColor: C.dangerBg }]}>
                <Text style={[d.badgeText, { color: C.danger }]}>Rx Rezeptpflichtig</Text>
              </View>
            )}
            {sub.controlled && (
              <View style={[d.badge, { backgroundColor: '#ef444420' }]}>
                <Text style={[d.badgeText, { color: '#ef4444' }]}>⚠ Betäubungsmittel</Text>
              </View>
            )}
            {!sub.prescription && (
              <View style={[d.badge, { backgroundColor: C.successBg }]}>
                <Text style={[d.badgeText, { color: C.success }]}>OTC Freiverkäuflich</Text>
              </View>
            )}
          </View>

          {/* PK Daten */}
          <View style={[d.card, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
            <Text style={[d.cardTitle, { color: C.textSub }]}>⏱ Pharmakokinetik</Text>
            <View style={d.pkGrid}>
              <PkCell label="Wirkbeginn"    value={`${sub.pk.onsetHours * 60} Min`} />
              <PkCell label="Peak"          value={`${sub.pk.tmaxHours} h`} />
              <PkCell label="Wirkdauer"     value={`${sub.pk.durationHours} h`} />
              <PkCell label="Halbwertszeit" value={`${sub.pk.halflifeHours} h`} />
              <PkCell label="Bioverfügbar"  value={`${sub.pk.bioavailability}%`} />
              {sub.pk.proteinBinding != null && <PkCell label="Proteinbindung" value={`${sub.pk.proteinBinding}%`} />}
            </View>
            {sub.pk.foodNote && (
              <Text style={[d.foodNote, { color: C.textSub }]}>🍽 {sub.pk.foodNote}</Text>
            )}
          </View>

          {/* Effekte */}
          {effects.length > 0 && (
            <View style={[d.card, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
              <Text style={[d.cardTitle, { color: C.textSub }]}>✨ Wirkungen</Text>
              {effects.map(([key, val]) => (
                <View key={key} style={d.effectRow}>
                  <Text style={[d.effectLabel, { color: C.textSub }]}>{EFFECT_LABELS[key] ?? key}</Text>
                  <View style={[d.effectBar, { backgroundColor: C.border2 }]}>
                    <View style={[d.effectFill, { width: `${val}%`, backgroundColor: sub.color ?? C.accent }]} />
                  </View>
                  <Text style={[d.effectVal, { color: C.textMuted }]}>{val}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Timing */}
          {sub.timing && (
            <View style={[d.card, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
              <Text style={[d.cardTitle, { color: C.textSub }]}>🕐 Einnahme-Empfehlung</Text>
              <Text style={[d.timingRec, { color: C.text }]}>{sub.timing.recommendation}</Text>
              <View style={d.timingGrid}>
                {sub.timing.maxPerDay    && <TCell label="Max/Tag"         value={`${sub.timing.maxPerDay}×`} />}
                {sub.timing.minIntervalH && <TCell label="Min. Abstand"    value={`${sub.timing.minIntervalH}h`} />}
                {sub.timing.maxDailyDose && <TCell label="Max. Tagesdosis" value={sub.timing.maxDailyDose} />}
              </View>
            </View>
          )}

          {/* Warnungen */}
          {sub.warnings?.length > 0 && (
            <View style={[d.card, { backgroundColor: C.bg2, borderColor: `${C.danger}30` }]}>
              <Text style={[d.cardTitle, { color: C.textSub }]}>⚠️ Hinweise</Text>
              {sub.warnings.map((w: string, i: number) => (
                <Text key={i} style={[d.warnText, { color: C.danger }]}>• {w}</Text>
              ))}
            </View>
          )}

          {/* Wirkmechanismus */}
          {sub.mechanism && (
            <View style={[d.card, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
              <Text style={[d.cardTitle, { color: C.textSub }]}>🔬 Wirkmechanismus</Text>
              <Text style={[d.mechanism, { color: C.textSub }]}>{sub.mechanism}</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function PkCell({ label, value }: { label: string; value: string }) {
  const { colors: C } = useThemeStore();
  return (
    <View style={[d.pkCell, { backgroundColor: C.bg }]}>
      <Text style={[d.pkVal, { color: C.accent }]}>{value}</Text>
      <Text style={[d.pkLabel, { color: C.textMuted }]}>{label}</Text>
    </View>
  );
}

function TCell({ label, value }: { label: string; value: string }) {
  const { colors: C } = useThemeStore();
  return (
    <View style={[d.pkCell, { backgroundColor: C.bg }]}>
      <Text style={[d.pkVal, { color: C.accent }]}>{value}</Text>
      <Text style={[d.pkLabel, { color: C.textMuted }]}>{label}</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function SubstancesScreen() {
  const { colors: C } = useThemeStore();
  const [query, setQuery]         = useState('');
  const [catFilter, setCat]       = useState<string | null>(null);
  const [selected, setSelected]   = useState<any>(null);
  const [addSub, setAddSub]       = useState<any>(null);
  const [addVisible, setAddVisible] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return (SUBSTANCES as any[]).filter(s => {
      const matchCat  = !catFilter || s.category === catFilter;
      const matchText = !q
        || s.name.toLowerCase().includes(q)
        || s.brandNames?.some((b: string) => b.toLowerCase().includes(q))
        || s.effectLabel?.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [query, catFilter]);

  function renderItem({ item }: { item: any }) {
    const cat = CATEGORIES.find((c: any) => c.id === item.category);
    return (
      <View style={[s.row, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => setSelected(item)}
          activeOpacity={0.75}
        >
          <SubIcon substance={item} size={44} />
          <View style={s.rowBody}>
            <View style={s.rowTop}>
              <Text style={[s.rowName, { color: C.text }]}>{item.name}</Text>
              {item.prescription && (
                <View style={[s.rxBadge, { backgroundColor: C.dangerBg }]}>
                  <Text style={[s.rxText, { color: C.danger }]}>Rx</Text>
                </View>
              )}
              {item.controlled && (
                <View style={[s.btmBadge, { backgroundColor: '#ef444420' }]}>
                  <Text style={[s.btmText, { color: '#ef4444' }]}>BTM</Text>
                </View>
              )}
            </View>
            <Text style={[s.rowCat, { color: C.textMuted }]}>{cat?.icon} {cat?.label}</Text>
            <Text style={[s.rowEffect, { color: C.textSub }]} numberOfLines={1}>{item.effectLabel}</Text>
          </View>
        </TouchableOpacity>
        {/* ＋ Direkt hinzufügen */}
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: `${item.color ?? C.accent}18`, borderColor: `${item.color ?? C.accent}40` }]}
          onPress={() => { setAddSub(item); setAddVisible(true); }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        >
          <Text style={[s.addBtnText, { color: item.color ?? C.accent }]}>＋</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Header */}
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: C.text }]}>Substanzen</Text>
        <Text style={[s.headerSub, { color: C.textMuted }]}>{filtered.length} von {(SUBSTANCES as any[]).length}</Text>
      </View>

      {/* Search */}
      <View style={[s.searchWrap, { backgroundColor: C.bg2, borderColor: C.border2 }]}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={[s.search, { color: C.text }]}
          placeholder="Suche nach Name, Marke, Wirkung…"
          placeholderTextColor={C.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips} contentContainerStyle={s.chipsContent}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[s.chip, { backgroundColor: C.bg2, borderColor: C.border2 },
            !catFilter && { backgroundColor: C.accentBg, borderColor: C.accent }]}
          onPress={() => setCat(null)}
        >
          <Text style={[s.chipText, { color: !catFilter ? C.accent : C.textSub }, !catFilter && { fontWeight: '700' }]}>
            Alle
          </Text>
        </TouchableOpacity>
        {(CATEGORIES as any[]).map(cat => {
          const active = catFilter === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              style={[s.chip, { backgroundColor: C.bg2, borderColor: C.border2 },
                active && { backgroundColor: `${cat.color}18`, borderColor: cat.color }]}
              onPress={() => setCat(active ? null : cat.id)}
            >
              <Text style={[s.chipText, { color: active ? cat.color : C.textSub }, active && { fontWeight: '700' }]}>
                {cat.icon} {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={[s.emptyTitle, { color: C.text }]}>Keine Treffer</Text>
            <Text style={[s.emptySub, { color: C.textMuted }]}>Versuche einen anderen Suchbegriff</Text>
          </View>
        }
      />

      <DetailModal sub={selected} onClose={() => setSelected(null)} />
      <AddIntakeModal
        visible={addVisible}
        onClose={() => { setAddVisible(false); setAddSub(null); }}
        initialSubstance={addSub}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  header:      { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSub:   { fontSize: 12, marginTop: 2 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, paddingHorizontal: 12, borderWidth: 1,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  search:     { flex: 1, fontSize: 15, paddingVertical: 11 },

  chips:        { height: 60, flexGrow: 0 },
  chipsContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  chipText:     { fontSize: 13, fontWeight: '500' },

  list: { padding: 16, paddingBottom: 32 },
  row:  {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1,
    gap: 10,
  },
  addBtn:     { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 20, fontWeight: '400', lineHeight: 24 },
  rowBody:   { flex: 1, marginLeft: 14 },
  rowTop:    { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  rowName:   { fontSize: 16, fontWeight: '700', marginRight: 8 },
  rowCat:    { fontSize: 12, marginBottom: 2 },
  rowEffect: { fontSize: 13 },
  rowArrow:  { fontSize: 20, marginLeft: 8 },

  rxBadge:  { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginRight: 4 },
  rxText:   { fontSize: 11, fontWeight: '700' },
  btmBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  btmText:  { fontSize: 11, fontWeight: '700' },

  empty:      { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub:   { fontSize: 13 },
});

const d = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, paddingBottom: 16, borderBottomWidth: 1,
  },
  headerText: { flex: 1, marginLeft: 14 },
  name:     { fontSize: 20, fontWeight: '800' },
  cat:      { fontSize: 13, marginTop: 2 },
  brands:   { fontSize: 13, marginTop: 2 },
  closeBtn: { padding: 8 },
  closeText:{ fontSize: 18 },

  badges:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  badge:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  card: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12 },

  pkGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pkCell:  { borderRadius: 10, padding: 10, minWidth: 90, alignItems: 'center' },
  pkVal:   { fontSize: 16, fontWeight: '700' },
  pkLabel: { fontSize: 12, marginTop: 3 },
  foodNote:{ fontSize: 13, marginTop: 10, lineHeight: 19 },

  effectRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  effectLabel: { width: 135, fontSize: 13 },
  effectBar:   { flex: 1, height: 7, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  effectFill:  { height: 7, borderRadius: 4 },
  effectVal:   { width: 28, fontSize: 13, textAlign: 'right' },

  timingRec:  { fontSize: 14, marginBottom: 12 },
  timingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  warnText:  { fontSize: 13, marginBottom: 6, lineHeight: 18 },
  mechanism: { fontSize: 13, lineHeight: 19 },
});
