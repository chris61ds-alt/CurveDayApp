import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TextInput, TouchableOpacity, Modal, ScrollView,
  StatusBar,
} from 'react-native';
import { SUBSTANCES, CATEGORIES } from '../../src/data/substanceDB';
import { SubIcon } from '../../src/components/SubIcon';
import { EFFECT_LABELS } from '../../src/utils/pkHelpers';

// ── Detail Modal ──────────────────────────────────────────────
function DetailModal({ sub, onClose }: { sub: any; onClose: () => void }) {
  if (!sub) return null;
  const cat = CATEGORIES.find((c: any) => c.id === sub.category);
  const effects = Object.entries(sub.effects as Record<string, number>)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={d.safe}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={d.header}>
          <SubIcon substance={sub} size={52} />
          <View style={d.headerText}>
            <Text style={d.name}>{sub.name}</Text>
            <Text style={d.cat}>{cat?.icon} {cat?.label}</Text>
            {sub.brandNames?.length > 0 && (
              <Text style={d.brands}>{sub.brandNames.slice(0, 3).join(' · ')}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={d.closeBtn}>
            <Text style={d.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={d.scroll}>

          {/* Badges */}
          <View style={d.badges}>
            {sub.prescription && <View style={[d.badge, { backgroundColor: '#f8714320' }]}><Text style={[d.badgeText, { color: '#f87143' }]}>Rx Rezeptpflichtig</Text></View>}
            {sub.controlled   && <View style={[d.badge, { backgroundColor: '#ef444420' }]}><Text style={[d.badgeText, { color: '#ef4444' }]}>⚠ Betäubungsmittel</Text></View>}
            {!sub.prescription && <View style={[d.badge, { backgroundColor: '#4ade8020' }]}><Text style={[d.badgeText, { color: '#4ade80' }]}>OTC Freiverkäuflich</Text></View>}
          </View>

          {/* PK Daten */}
          <View style={d.card}>
            <Text style={d.cardTitle}>⏱ Pharmakokinetik</Text>
            <View style={d.pkGrid}>
              <PkCell label="Wirkbeginn"   value={`${sub.pk.onsetHours * 60} Min`} />
              <PkCell label="Peak"         value={`${sub.pk.tmaxHours} h`} />
              <PkCell label="Wirkdauer"    value={`${sub.pk.durationHours} h`} />
              <PkCell label="Halbwertszeit" value={`${sub.pk.halflifeHours} h`} />
              <PkCell label="Bioverfügbar" value={`${sub.pk.bioavailability}%`} />
              {sub.pk.proteinBinding != null && <PkCell label="Proteinbindung" value={`${sub.pk.proteinBinding}%`} />}
            </View>
            {sub.pk.foodNote && (
              <Text style={d.foodNote}>🍽 {sub.pk.foodNote}</Text>
            )}
          </View>

          {/* Effekte */}
          {effects.length > 0 && (
            <View style={d.card}>
              <Text style={d.cardTitle}>✨ Wirkungen</Text>
              {effects.map(([key, val]) => (
                <View key={key} style={d.effectRow}>
                  <Text style={d.effectLabel}>{EFFECT_LABELS[key] ?? key}</Text>
                  <View style={d.effectBar}>
                    <View style={[d.effectFill, { width: `${val}%`, backgroundColor: sub.color ?? '#38bdf8' }]} />
                  </View>
                  <Text style={d.effectVal}>{val}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Timing */}
          {sub.timing && (
            <View style={d.card}>
              <Text style={d.cardTitle}>🕐 Einnahme-Empfehlung</Text>
              <Text style={d.timingRec}>{sub.timing.recommendation}</Text>
              <View style={d.timingGrid}>
                {sub.timing.maxPerDay    && <TCell label="Max/Tag"      value={`${sub.timing.maxPerDay}×`} />}
                {sub.timing.minIntervalH && <TCell label="Min. Abstand" value={`${sub.timing.minIntervalH}h`} />}
                {sub.timing.maxDailyDose && <TCell label="Max. Tagesdosis" value={sub.timing.maxDailyDose} />}
              </View>
            </View>
          )}

          {/* Warnungen */}
          {sub.warnings?.length > 0 && (
            <View style={[d.card, d.warnCard]}>
              <Text style={d.cardTitle}>⚠️ Hinweise</Text>
              {sub.warnings.map((w: string, i: number) => (
                <Text key={i} style={d.warnText}>• {w}</Text>
              ))}
            </View>
          )}

          {/* Wirkmechanismus */}
          {sub.mechanism && (
            <View style={d.card}>
              <Text style={d.cardTitle}>🔬 Wirkmechanismus</Text>
              <Text style={d.mechanism}>{sub.mechanism}</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function PkCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={d.pkCell}>
      <Text style={d.pkVal}>{value}</Text>
      <Text style={d.pkLabel}>{label}</Text>
    </View>
  );
}

function TCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={d.pkCell}>
      <Text style={d.pkVal}>{value}</Text>
      <Text style={d.pkLabel}>{label}</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function SubstancesScreen() {
  const [query, setQuery]       = useState('');
  const [catFilter, setCat]     = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);

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
      <TouchableOpacity style={s.row} onPress={() => setSelected(item)} activeOpacity={0.75}>
        <SubIcon substance={item} size={44} />
        <View style={s.rowBody}>
          <View style={s.rowTop}>
            <Text style={s.rowName}>{item.name}</Text>
            {item.prescription && <View style={s.rxBadge}><Text style={s.rxText}>Rx</Text></View>}
            {item.controlled   && <View style={s.btmBadge}><Text style={s.btmText}>BTM</Text></View>}
          </View>
          <Text style={s.rowCat}>{cat?.icon} {cat?.label}</Text>
          <Text style={s.rowEffect} numberOfLines={1}>{item.effectLabel}</Text>
        </View>
        <Text style={s.rowArrow}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#060b13" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Substanzen</Text>
        <Text style={s.headerSub}>{filtered.length} von {(SUBSTANCES as any[]).length}</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.search}
          placeholder="Suche nach Name, Marke, Wirkung…"
          placeholderTextColor="#4a5a70"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips} contentContainerStyle={s.chipsContent}>
        <TouchableOpacity
          style={[s.chip, !catFilter && s.chipActive]}
          onPress={() => setCat(null)}
        >
          <Text style={[s.chipText, !catFilter && s.chipTextActive]}>Alle</Text>
        </TouchableOpacity>
        {(CATEGORIES as any[]).map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[s.chip, catFilter === cat.id && s.chipActive, catFilter === cat.id && { borderColor: cat.color }]}
            onPress={() => setCat(catFilter === cat.id ? null : cat.id)}
          >
            <Text style={s.chipText}>{cat.icon} {cat.label}</Text>
          </TouchableOpacity>
        ))}
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
            <Text style={s.emptyTitle}>Keine Treffer</Text>
            <Text style={s.emptySub}>Versuche einen anderen Suchbegriff</Text>
          </View>
        }
      />

      <DetailModal sub={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060b13' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub:   { fontSize: 12, color: '#4a5a70', marginTop: 2 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#0d1a2a', borderRadius: 12,
    paddingHorizontal: 12, borderWidth: 1, borderColor: '#132033',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  search: { flex: 1, color: '#e2f0ff', fontSize: 15, paddingVertical: 11 },

  chips: { maxHeight: 44 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#0d1a2a', borderRadius: 20,
    borderWidth: 1, borderColor: '#132033',
  },
  chipActive:     { backgroundColor: '#38bdf820', borderColor: '#38bdf8' },
  chipText:       { fontSize: 12, color: '#7a9ab5' },
  chipTextActive: { color: '#38bdf8', fontWeight: '700' },

  list: { padding: 16, paddingBottom: 32 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1a2a', borderRadius: 14,
    padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#132033',
  },
  rowBody:   { flex: 1, marginLeft: 12 },
  rowTop:    { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  rowName:   { fontSize: 15, fontWeight: '700', color: '#e2f0ff', marginRight: 8 },
  rowCat:    { fontSize: 11, color: '#4a5a70', marginBottom: 1 },
  rowEffect: { fontSize: 12, color: '#7a9ab5' },
  rowArrow:  { fontSize: 20, color: '#4a5a70', marginLeft: 8 },

  rxBadge:  { backgroundColor: '#f8714320', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1, marginRight: 4 },
  rxText:   { fontSize: 10, color: '#f87143', fontWeight: '700' },
  btmBadge: { backgroundColor: '#ef444420', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 },
  btmText:  { fontSize: 10, color: '#ef4444', fontWeight: '700' },

  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 6 },
  emptySub:   { fontSize: 13, color: '#4a5a70' },
});

const d = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#060b13' },
  scroll: { padding: 20, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#0d1a2a',
  },
  headerText: { flex: 1, marginLeft: 14 },
  name:    { fontSize: 20, fontWeight: '800', color: '#fff' },
  cat:     { fontSize: 13, color: '#7a9ab5', marginTop: 2 },
  brands:  { fontSize: 11, color: '#4a5a70', marginTop: 2 },
  closeBtn:  { padding: 8 },
  closeText: { fontSize: 18, color: '#4a5a70' },

  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  badge:  { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  card: {
    backgroundColor: '#0d1a2a', borderRadius: 14,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#132033',
  },
  warnCard: { borderColor: '#f8714330' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#7a9ab5', marginBottom: 12 },

  pkGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pkCell:  { backgroundColor: '#060b13', borderRadius: 10, padding: 10, minWidth: 90, alignItems: 'center' },
  pkVal:   { fontSize: 16, fontWeight: '700', color: '#38bdf8' },
  pkLabel: { fontSize: 10, color: '#4a5a70', marginTop: 2 },
  foodNote: { fontSize: 12, color: '#7a9ab5', marginTop: 10, lineHeight: 17 },

  effectRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  effectLabel:{ width: 130, fontSize: 12, color: '#7a9ab5' },
  effectBar:  { flex: 1, height: 6, backgroundColor: '#132033', borderRadius: 3, marginHorizontal: 8, overflow: 'hidden' },
  effectFill: { height: 6, borderRadius: 3 },
  effectVal:  { width: 28, fontSize: 12, color: '#4a5a70', textAlign: 'right' },

  timingRec:  { fontSize: 13, color: '#e2f0ff', marginBottom: 12 },
  timingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  warnText:  { fontSize: 13, color: '#f87143', marginBottom: 6, lineHeight: 18 },
  mechanism: { fontSize: 13, color: '#7a9ab5', lineHeight: 19 },
});
