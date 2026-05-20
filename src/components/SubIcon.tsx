import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  substance?: { id?: string; icon?: string; color: string; category?: string };
  icon?: string;
  color?: string;
  size?: number;
}

// ── Per-substance icon (most specific) ───────────────────────────
const SUBSTANCE_ICON: Record<string, string> = {
  // Analgesics — each one distinct
  ibuprofen:      'pill',
  paracetamol:    'thermometer',
  aspirin:        'pill',
  diclofenac:     'needle',
  naproxen:       'pill',

  // ADHD / stimulant meds
  mph_ir:         'lightning-bolt',
  mph_ret:        'lightning-bolt',
  concerta:       'lightning-bolt',
  lisdex:         'brain',
  atomoxetin:     'brain',
  dexamphetamin:  'lightning-bolt',
  adderall:       'lightning-bolt',

  // Sleep
  melatonin:      'moon-waning-crescent',
  baldrian:       'flower',
  diphenhydramin: 'power-sleep',
  doxylamin:      'power-sleep',

  // Stimulants (caffeine)
  koffein:        'coffee',
  espresso:       'coffee',
  filterkaffee:   'coffee-to-go',
  cappuccino:     'coffee',
  redbull:        'lightning-bolt',
  monster:        'lightning-bolt',

  // Nicotine
  nikotin_patch:  'bandage',
  zigarette:      'smoking',
  e_zigarette:    'cloud',
  nikotinbeutel:  'circle-slice-8',

  // Alcohol — each vessel distinct
  alkohol:        'glass-cocktail',
  bier_klein:     'beer-outline',
  bier_gross:     'beer',
  weissbier:      'beer-outline',
  wein_glas:      'wine',
  wein_gross:     'wine',
  sekt_glas:      'glass-flute',
  shot:           'glass-shot',
  longdrink:      'glass-cocktail',

  // Antihistamines
  cetirizin:      'flower-pollen',
  loratadin:      'leaf',
  desloratadin:   'flower',
  fexofenadin:    'leaf',

  // Supplements — most varied
  vitamin_d3:     'weather-sunny',
  magnesium:      'atom-variant',
  l_theanin:      'tea',
  vitamin_b12:    'battery-charging',
  omega3:         'fish',
  zink:           'shield-check',
  eisen:          'water-alert',
  kreatin:        'arm-flex',
  ashwagandha:    'sprout',
  vitamin_c:      'fruit-citrus',
  coq10:          'lightning-bolt',

  // Cardiovascular
  metoprolol:     'heart-pulse',
  ramipril:       'heart',
  amlodipin:      'heart-outline',

  // Antidepressants
  sertralin:      'white-balance-sunny',
  escitalopram:   'white-balance-sunny',

  // Gastro
  omeprazol:      'water',

  // Recreational
  cannabis_thc:   'cannabis',
  ketamin:        'needle',
};

// ── Category fallback (when no per-substance entry) ──────────────
const CATEGORY_ICON: Record<string, string> = {
  analgesic:      'pill',
  adhd:           'brain',
  sleep:          'moon-waning-crescent',
  stimulant:      'coffee',
  antihistamine:  'flower-pollen',
  cardiovascular: 'heart-pulse',
  antidepressant: 'white-balance-sunny',
  supplement:     'sprout',
  gastro:         'water',
  recreational:   'glass-cocktail',
  nicotine:       'smoking',
};

export function SubIcon({ substance, color: colorProp, size = 36 }: Props) {
  const color    = substance?.color ?? colorProp ?? '#38bdf8';
  const id       = substance?.id;
  const category = substance?.category;

  // Lookup order: per-substance → per-category → fallback
  const iconName = (id && SUBSTANCE_ICON[id])
    ?? (category && CATEGORY_ICON[category])
    ?? 'pill';

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
