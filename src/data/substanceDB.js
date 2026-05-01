/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  CurveDay – Substance Database v1.0                      ║
 * ║  Pharmakologische Daten für Visualisierungszwecke        ║
 * ║  Quellen: Fachinformationen, PubMed, klinische PK-Daten  ║
 * ║  ⚠️  Kein medizinischer Rat – nur zur Information        ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * PK-Felder Erklärung:
 *   onsetHours    → Stunden bis erste Wirkung spürbar
 *   tmaxHours     → Stunden bis Wirkpeak (ab Einnahme)
 *   durationHours → Gesamte Wirkdauer in Stunden
 *   halflifeHours → Pharmakologische Halbwertszeit
 *   bioavailability → Bioverfügbarkeit in %
 *   foodEffect    → "none" | "minor" | "moderate" | "major"
 *   curveType     → "acute" (Tageskurve) | "chronic" (Wochen-Effekt)
 */

// ─────────────────────────────────────────────────────────────
// KATEGORIEN
// ─────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: "analgesic",      label: "Schmerzmittel",         icon: "💊", color: "#c084fc" },
  { id: "adhd",           label: "ADHS-Medikamente",      icon: "🧠", color: "#38bdf8" },
  { id: "sleep",          label: "Schlaf & Beruhigung",   icon: "🌙", color: "#818cf8" },
  { id: "stimulant",      label: "Stimulanzien",          icon: "⚡", color: "#f59e0b" },
  { id: "antihistamine",  label: "Antihistaminika",       icon: "🌿", color: "#34d399" },
  { id: "cardiovascular", label: "Herz & Kreislauf",      icon: "❤️", color: "#f87171" },
  { id: "antidepressant", label: "Antidepressiva",        icon: "🌈", color: "#fb923c" },
  { id: "supplement",     label: "Nahrungsergänzung",     icon: "🌱", color: "#4ade80" },
  { id: "gastro",         label: "Magen & Darm",          icon: "🫃", color: "#a3e635" },
  { id: "recreational",   label: "Genussmittel",          icon: "🍺", color: "#94a3b8" },
];

// ─────────────────────────────────────────────────────────────
// SUBSTANZ-DATENBANK  (50 Substanzen)
// ─────────────────────────────────────────────────────────────
export const SUBSTANCES = [

  // ════════════════════════════════════════
  // SCHMERZMITTEL / ANALGETIKA
  // ════════════════════════════════════════

  {
    id: "ibuprofen",
    name: "Ibuprofen",
    nameUS: "Ibuprofen (Advil / Motrin)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Nurofen", "Ibuflam", "Advil", "Motrin", "Dolormin"],
    category: "analgesic",
    icon: "💊",
    color: "#c084fc",
    doseUnit: "mg",
    commonDoses: [200, 400, 600, 800],
    defaultDose: 400,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.5,
      durationHours: 7,
      halflifeHours: 2,
      bioavailability: 80,
      proteinBinding: 99,
      foodEffect: "minor",
      foodNote: "Mit Mahlzeit: reduziert Magenreizung, verlangsamt Peak leicht",
      curveType: "acute",
    },
    effects: { pain: 80, inflammation: 75, fever: 70 },
    effectLabel: "Schmerzreduktion",
    maxEffectScore: 78,
    timing: {
      recommendation: "Mit Mahlzeit oder Milch",
      avoidBeforeSleepH: 0,
      maxPerDay: 3,
      minIntervalH: 6,
      maxDailyDose: "1200 mg (OTC)",
    },
    warnings: [
      "Nicht auf nüchternen Magen",
      "Nicht bei Nieren- oder Magenerkrankungen",
      "Max. 3 Tage Selbstmedikation",
      "Nicht mit anderen NSAIDs kombinieren",
    ],
    mechanism: "COX-1 & COX-2-Hemmer (NSAID)",
  },

  {
    id: "paracetamol",
    name: "Paracetamol",
    nameUS: "Acetaminophen (Tylenol)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Panadol", "ben-u-ron", "Tylenol", "Perfalgan"],
    category: "analgesic",
    icon: "💊",
    color: "#e879f9",
    doseUnit: "mg",
    commonDoses: [500, 1000],
    defaultDose: 1000,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 0.75,
      durationHours: 5,
      halflifeHours: 2.5,
      bioavailability: 85,
      proteinBinding: 10,
      foodEffect: "minor",
      foodNote: "Mahlzeit verzögert Resorption minimal – klinisch irrelevant",
      curveType: "acute",
    },
    effects: { pain: 75, fever: 82 },
    effectLabel: "Schmerzreduktion",
    maxEffectScore: 75,
    timing: {
      recommendation: "Unabhängig von Mahlzeiten",
      maxPerDay: 4,
      minIntervalH: 4,
      maxDailyDose: "4000 mg (Erwachsene)",
    },
    warnings: [
      "⚠️ Max. 4000 mg/Tag – Leberschaden möglich!",
      "Kein Alkohol bei Einnahme",
      "Prüfe Kombi-Präparate auf verstecktes Paracetamol",
    ],
    mechanism: "Zentrales Analgetikum/Antipyretikum – kein Antirheumatikum",
  },

  {
    id: "aspirin",
    name: "Aspirin (ASS)",
    nameUS: "Aspirin (Acetylsalicylic Acid)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Aspirin", "ASS-ratiopharm", "Aspirin Cardio 100", "Bayer Aspirin"],
    category: "analgesic",
    icon: "💊",
    color: "#d946ef",
    doseUnit: "mg",
    commonDoses: [100, 300, 500],
    defaultDose: 500,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.0,
      durationHours: 5,
      halflifeHours: 0.3,  // ASS selbst; aktiver Metabolit Salicylat: 2–6h
      bioavailability: 68,
      proteinBinding: 80,
      foodEffect: "minor",
      foodNote: "Mit Wasser und leichter Nahrung einnehmen",
      curveType: "acute",
      specialNote: "Thrombozytenhemmung (ASS 100) irreversibel – hält 7–10 Tage!",
    },
    effects: { pain: 70, inflammation: 62, fever: 65, antiplatelet: 100 },
    effectLabel: "Schmerzreduktion",
    maxEffectScore: 70,
    timing: {
      recommendation: "Mit Mahlzeit – bei ASS 100: morgens",
      maxPerDay: 3,
      minIntervalH: 4,
      maxDailyDose: "3000 mg",
    },
    warnings: [
      "⚠️ Plättchenhemmung hält 7–10 Tage nach letzter Dosis!",
      "Nicht bei Kindern <12 Jahren (Reye-Syndrom)",
      "Magenblutungsrisiko bei Dauertherapie",
      "Nicht gleichzeitig mit Ibuprofen",
    ],
    mechanism: "Irreversibler COX-Hemmer & Thrombozytenaggregationshemmer",
  },

  {
    id: "diclofenac",
    name: "Diclofenac",
    nameUS: "Diclofenac (Voltaren)",
    markets: ["DE", "US", "AT", "CH"],  // US: topical OTC only; oral is Rx
    brandNames: ["Voltaren", "Diclac", "Rewodina"],
    category: "analgesic",
    icon: "💊",
    color: "#a855f7",
    doseUnit: "mg",
    commonDoses: [25, 50, 75],
    defaultDose: 50,
    prescription: true,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.5,
      durationHours: 8,
      halflifeHours: 1.5,
      bioavailability: 50,
      proteinBinding: 99,
      foodEffect: "moderate",
      foodNote: "Nüchtern: schnellerer Peak. Mit Essen: geringere Absorption aber besser verträglich",
      curveType: "acute",
    },
    effects: { pain: 85, inflammation: 88, fever: 62 },
    effectLabel: "Schmerzreduktion",
    maxEffectScore: 83,
    timing: {
      recommendation: "Je nach Präparat: vor oder nach Mahlzeit",
      maxPerDay: 2,
      minIntervalH: 8,
      maxDailyDose: "150 mg",
    },
    warnings: [
      "Erhöhtes kardiovaskuläres Risiko bei Langzeitanwendung",
      "Nicht bei Magengeschwüren",
      "Kein Alkohol",
    ],
    mechanism: "Präferenziell COX-2-selektives NSAID",
  },

  {
    id: "naproxen",
    name: "Naproxen",
    nameUS: "Naproxen (Aleve)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Aleve", "Proxen", "Dysmenalgit"],
    category: "analgesic",
    icon: "💊",
    color: "#7c3aed",
    doseUnit: "mg",
    commonDoses: [250, 500],
    defaultDose: 500,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 2.0,
      durationHours: 12,
      halflifeHours: 14,
      bioavailability: 95,
      proteinBinding: 99,
      foodEffect: "minor",
      foodNote: "Mit Mahlzeit – reduziert Magenreizung",
      curveType: "acute",
    },
    effects: { pain: 80, inflammation: 82, fever: 65 },
    effectLabel: "Schmerzreduktion",
    maxEffectScore: 80,
    timing: {
      recommendation: "2x täglich mit Mahlzeit",
      maxPerDay: 2,
      minIntervalH: 8,
      maxDailyDose: "1000 mg",
    },
    warnings: ["Magenreizung möglich", "Nicht bei Nierenproblemen"],
    mechanism: "NSAID – längere Wirkdauer als Ibuprofen",
  },


  // ════════════════════════════════════════
  // ADHS-MEDIKAMENTE
  // ════════════════════════════════════════

  {
    id: "mph_ir",
    name: "Methylphenidat IR",
    nameUS: "Methylphenidate IR (Ritalin)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Ritalin", "Medikinet", "Methylphenidat-ratiopharm"],
    category: "adhd",
    icon: "🧠",
    color: "#38bdf8",
    doseUnit: "mg",
    commonDoses: [5, 10, 20],
    defaultDose: 10,
    prescription: true,
    controlled: true,  // BtM!
    pk: {
      onsetHours: 0.3,
      tmaxHours: 1.5,
      durationHours: 4,
      halflifeHours: 2.5,
      bioavailability: 30,
      proteinBinding: 15,
      foodEffect: "minor",
      foodNote: "Mit Essen: leichte Verzögerung des Peaks, klinisch kaum relevant",
      curveType: "acute",
      specialNote: "Rebound-Effekt möglich beim Abklingen (Stimmungsabfall, Reizbarkeit)",
    },
    effects: { concentration: 85, impulseControl: 80, energy: 55, mood: 35 },
    effectLabel: "Konzentration",
    maxEffectScore: 85,
    timing: {
      recommendation: "Morgens und ggf. mittags (max. 15:00 Uhr)",
      avoidBeforeSleepH: 6,
      maxPerDay: 3,
      minIntervalH: 4,
      maxDailyDose: "60 mg",
    },
    warnings: [
      "⚠️ Keine Einnahme nach 15:00 Uhr (Schlafstörungen)",
      "Blutdruck und Herzfrequenz kontrollieren",
      "Appetitunterdrückung – auf Ernährung achten",
      "Rebound-Effekt beim Abklingen möglich",
    ],
    mechanism: "DAT/NET-Inhibitor – erhöht Dopamin/Noradrenalin im synaptischen Spalt",
  },

  {
    id: "mph_ret",
    name: "Methylphenidat Retard",
    nameUS: "Methylphenidate XR (Ritalin LA)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Ritalin LA", "Medikinet retard", "Methylphenidat-retard"],
    category: "adhd",
    icon: "🧠",
    color: "#0ea5e9",
    doseUnit: "mg",
    commonDoses: [10, 20, 30, 40],
    defaultDose: 20,
    prescription: true,
    controlled: true,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 4.5,    // zweiter Peak der bimodalen Freisetzung
      durationHours: 8,
      halflifeHours: 3.5,
      bioavailability: 30,
      proteinBinding: 15,
      foodEffect: "major",
      foodNote: "⚠️ Medikinet retard: Fetthaltige Mahlzeit NOTWENDIG für korrekte Freisetzung! Magensäure-pH beeinflusst Release-Mechanismus",
      releaseProfile: "bimodal_50_50",
      curveType: "acute",
    },
    effects: { concentration: 87, impulseControl: 83, energy: 52, mood: 38 },
    effectLabel: "Konzentration",
    maxEffectScore: 87,
    timing: {
      recommendation: "Morgens mit fettreicher Mahlzeit (Medikinet) – 1x täglich",
      avoidBeforeSleepH: 10,
      maxPerDay: 1,
      minIntervalH: 24,
      maxDailyDose: "60 mg",
    },
    warnings: [
      "Nur morgens einnehmen!",
      "Kapseln nicht zerkauen (außer Streuen auf Nahrung)",
      "Schlafstörungen bei zu später Einnahme",
    ],
    mechanism: "Bimodales Release: 50% sofort / 50% nach 4h – entspricht 2x IR-Gabe",
  },

  {
    id: "concerta",
    name: "Methylphenidat OROS",
    nameUS: "Methylphenidate OROS (Concerta)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Concerta", "Equasym XL"],
    category: "adhd",
    icon: "🧠",
    color: "#0284c7",
    doseUnit: "mg",
    commonDoses: [18, 27, 36, 54],
    defaultDose: 36,
    prescription: true,
    controlled: true,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 6.0,    // OROS-System: aufsteigender Spiegel über den Tag
      durationHours: 12,
      halflifeHours: 3.5,
      bioavailability: 22,
      foodEffect: "none",
      foodNote: "OROS-System (osmotische Pumpe) – unabhängig von Mahlzeiten",
      releaseProfile: "ascending_22_78",  // 22% sofort, 78% osmotisch
      curveType: "acute",
    },
    effects: { concentration: 88, impulseControl: 85, energy: 50, mood: 38 },
    effectLabel: "Konzentration",
    maxEffectScore: 88,
    timing: {
      recommendation: "Morgens – unabhängig von Mahlzeiten",
      avoidBeforeSleepH: 12,
      maxPerDay: 1,
      maxDailyDose: "54 mg",
    },
    warnings: [
      "12h Wirkdauer – Timing entscheidend für Schlaf",
      "Tablette NICHT teilen/kauen (OROS-Mechanismus zerstört)",
      "Leere Hülle im Stuhl sichtbar – normal!",
    ],
    mechanism: "OROS-Technologie: osmotische Pumpe mit aufsteigendem Freisetzungsprofil",
  },

  {
    id: "lisdex",
    name: "Lisdexamfetamin",
    nameUS: "Lisdexamfetamine (Vyvanse)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Vyvanse", "Elvanse"],
    category: "adhd",
    icon: "🧠",
    color: "#06b6d4",
    doseUnit: "mg",
    commonDoses: [20, 30, 40, 50, 60, 70],
    defaultDose: 50,
    prescription: true,
    controlled: true,
    pk: {
      onsetHours: 1.5,   // Pro-Drug – muss erst zu d-Amphetamin hydrolysiert werden
      tmaxHours: 4.0,
      durationHours: 14,
      halflifeHours: 12,
      bioavailability: 96,  // nach Hydrolyse zu d-Amphetamin
      proteinBinding: 20,
      foodEffect: "none",
      foodNote: "Mahlzeiten beeinflussen Absorption kaum – gleichmäßige Wirkung",
      curveType: "acute",
      specialNote: "Prodrug → d-Amphetamin durch intestinale Hydrolyse. Missbrauchspotential reduziert.",
    },
    effects: { concentration: 92, impulseControl: 88, energy: 65, mood: 48 },
    effectLabel: "Konzentration",
    maxEffectScore: 90,
    timing: {
      recommendation: "Morgens – unabhängig von Mahlzeiten",
      avoidBeforeSleepH: 12,
      maxPerDay: 1,
      maxDailyDose: "70 mg",
    },
    warnings: [
      "14h Wirkdauer – früh einnehmen!",
      "Kann Missbrauchspotential reduzieren (durch Prodrug-Mechanismus)",
      "Herz-Kreislauf-Überwachung",
      "BtM – Rezept erforderlich",
    ],
    mechanism: "Prodrug: Lisdexamfetamin → d-Amphetamin (durch Peptidase im GIT/Blut)",
  },

  {
    id: "atomoxetin",
    name: "Atomoxetin",
    nameUS: "Atomoxetine (Strattera)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Strattera"],
    category: "adhd",
    icon: "🧠",
    color: "#7dd3fc",
    doseUnit: "mg",
    commonDoses: [18, 25, 40, 60, 80, 100],
    defaultDose: 40,
    prescription: true,
    controlled: false,  // Kein BtM!
    pk: {
      onsetHours: null,  // Klinische Wirkung erst nach 2–4 Wochen
      tmaxHours: 1.5,    // Nur Serumspiegel-Peak
      durationHours: 24,
      halflifeHours: 5,  // Extensive Metabolizer (PM: 21h)
      bioavailability: 63,
      proteinBinding: 98,
      foodEffect: "none",
      foodNote: "Mahlzeiten irrelevant für Absorption",
      curveType: "chronic",
      effectOnset: "⚠️ Klinische Wirkung erst nach 2–4 Wochen Dauertherapie sichtbar!",
    },
    effects: { concentration: 70, impulseControl: 72, mood: 30 },
    effectLabel: "Konzentration (chronisch)",
    maxEffectScore: 70,
    timing: {
      recommendation: "Morgens – 1x täglich",
      avoidBeforeSleepH: 0,  // kein Stimulans!
      maxPerDay: 1,
      maxDailyDose: "100 mg",
    },
    warnings: [
      "⚠️ KEIN Stimulans – keine sofortige Wirkung",
      "Kein Missbrauchspotential (kein BtM)",
      "Seltene schwere Leberschäden möglich",
      "Suizidgedanken zu Beginn erhöht überwachen (wie SSRIs)",
    ],
    mechanism: "Selektiver NET-Inhibitor (Noradrenalin-Wiederaufnahmehemmer)",
  },

  {
    id: "dexamphetamin",
    name: "Dexamfetamin",
    nameUS: "Dextroamphetamine (Dexedrine)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Attentin", "Dexedrine"],
    category: "adhd",
    icon: "🧠",
    color: "#bae6fd",
    doseUnit: "mg",
    commonDoses: [5, 10, 20],
    defaultDose: 10,
    prescription: true,
    controlled: true,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 2.5,
      durationHours: 6,
      halflifeHours: 10,
      bioavailability: 90,
      proteinBinding: 20,
      foodEffect: "minor",
      curveType: "acute",
    },
    effects: { concentration: 88, impulseControl: 85, energy: 72, mood: 50 },
    effectLabel: "Konzentration",
    maxEffectScore: 88,
    timing: {
      recommendation: "Morgens und ggf. mittags",
      avoidBeforeSleepH: 8,
      maxPerDay: 3,
      minIntervalH: 4,
      maxDailyDose: "40 mg",
    },
    warnings: [
      "Starkes Missbrauchspotential (BtM)",
      "Herzfrequenz und Blutdruck überwachen",
      "Appetitsuppression ausgeprägt",
    ],
    mechanism: "d-Amphetamin – Dopamin/Noradrenalin-Reuptake-Hemmer und Releaser",
  },


  {
    id: "adderall",
    name: "Adderall (Mixed Amphetamine Salts)",
    nameUS: "Adderall",
    markets: ["US"],  // FDA approved; not available DE/AT/CH
    brandNames: ["Adderall", "Adderall XR"],
    category: "adhd",
    icon: "🧠",
    color: "#06b6d4",
    doseUnit: "mg",
    commonDoses: [5, 10, 15, 20, 30],
    defaultDose: 20,
    prescription: true,
    controlled: true,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 3.0,
      durationHours: 6,
      halflifeHours: 11,   // d-amphetamine: ~10h, l-amphetamine: ~13h
      bioavailability: 75,
      proteinBinding: 20,
      foodEffect: "minor",
      foodNote: "High-fat meal delays peak ~1h but doesn't reduce absorption",
      curveType: "acute",
      specialNote: "75% d-amphetamine / 25% l-amphetamine ratio",
    },
    effects: { concentration: 90, impulseControl: 85, energy: 68, mood: 50 },
    effectLabel: "Concentration",
    maxEffectScore: 88,
    timing: {
      recommendation: "Morning; second dose no later than noon",
      avoidBeforeSleepH: 8,
      maxPerDay: 2,
      minIntervalH: 4,
      maxDailyDose: "40 mg",
    },
    warnings: [
      "⚠️ Schedule II controlled substance",
      "Do not take after 2 PM (insomnia risk)",
      "Monitor heart rate and blood pressure",
      "Appetite suppression – eat on schedule",
      "Crash/rebound effect as dose wears off",
    ],
    mechanism: "Mixed amphetamine salts – dopamine/norepinephrine reuptake inhibitor and releaser",
  },

  // ════════════════════════════════════════
  // SCHLAF & BERUHIGUNG
  // ════════════════════════════════════════

  {
    id: "melatonin",
    name: "Melatonin",
    nameUS: "Melatonin",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Circadin", "Melatonin 0,5mg", "Sleepo", "Doc Melatonin", "Natrol", "ZzzQuil Pure Zzzs"],
    category: "sleep",
    icon: "🌙",
    color: "#818cf8",
    doseUnit: "mg",
    commonDoses: [0.5, 1, 2, 5],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.0,
      durationHours: 4,
      halflifeHours: 0.75,
      bioavailability: 15,   // oral sehr variabel (3–33%!)
      proteinBinding: 60,
      foodEffect: "major",
      foodNote: "Nüchtern einnehmen! Mit Mahlzeit verzögert sich Peak um ~1h",
      curveType: "acute",
      specialNote: "Niedrige Dosen (0.5–1mg) oft wirksamer als 5mg!",
    },
    effects: { sleep: 80, relaxation: 50, circadianReset: 90 },
    effectLabel: "Schlaf & Rhythmus",
    maxEffectScore: 78,
    timing: {
      recommendation: "30–60 min vor Schlaf – im Dunkeln!",
      maxPerDay: 1,
      maxDailyDose: "10 mg (besser: 0.5–2 mg)",
    },
    warnings: [
      "Niedrige Dosen bevorzugen (0.5–1mg)",
      "Lichtvermeidung nach Einnahme wichtig",
      "Kein langfristiger Ersatz für Schlafhygiene",
      "Bei Schwangerschaft: Arzt konsultieren",
    ],
    mechanism: "Endogenes Hormon – reguliert zirkadianen Rhythmus via MT1/MT2-Rezeptoren",
  },

  {
    id: "baldrian",
    name: "Baldrian",
    nameUS: "Valerian Root",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Baldriparan", "Sedonium", "Euvegal", "Kytta Sedativum", "Nature's Bounty Valerian"],
    category: "sleep",
    icon: "🌿",
    color: "#6366f1",
    doseUnit: "mg",
    commonDoses: [300, 600, 900],
    defaultDose: 600,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 2.0,
      durationHours: 6,
      halflifeHours: 2,
      bioavailability: 20,
      foodEffect: "none",
      curveType: "acute",
      effectOnset: "Volle sedierende Wirkung erst nach 2–4 Wochen Dauertherapie",
    },
    effects: { sleep: 50, relaxation: 55 },
    effectLabel: "Entspannung",
    maxEffectScore: 50,
    timing: {
      recommendation: "30–60 min vor dem Schlaf",
      maxPerDay: 3,
      maxDailyDose: "1800 mg",
    },
    warnings: [
      "Kein Autofahren nach Einnahme",
      "Nicht kombinieren mit Alkohol oder anderen Sedativa",
      "Wirkung oft mild – bei schwerem Schlafproblem nicht ausreichend",
    ],
    mechanism: "Phytopharmazeutikum – Valerensäure moduliert GABAerges System",
  },

  {
    id: "diphenhydramin",
    name: "Diphenhydramin",
    nameUS: "Diphenhydramine (Benadryl / ZzzQuil)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Betadorm", "Nytol", "Sediat", "Sedaplus", "Benadryl", "ZzzQuil", "Unisom SleepGels"],
    category: "sleep",
    icon: "😴",
    color: "#4f46e5",
    doseUnit: "mg",
    commonDoses: [25, 50],
    defaultDose: 50,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 2.5,
      durationHours: 8,
      halflifeHours: 8,
      bioavailability: 50,
      proteinBinding: 80,
      foodEffect: "none",
      curveType: "acute",
      specialNote: "⚠️ Hangover-Effekt am nächsten Morgen. Toleranz nach 3 Tagen!",
    },
    effects: { sleep: 75, relaxation: 62, antihistamine: 80 },
    effectLabel: "Schlaf",
    maxEffectScore: 72,
    timing: {
      recommendation: "30 min vor dem Schlafen",
      maxPerDay: 1,
      maxDailyDose: "50 mg",
    },
    warnings: [
      "⚠️ Nicht für Dauereinnahme (Toleranz nach 3 Tagen!)",
      "Ausgeprägter 'Hangover' am nächsten Morgen",
      "Anticholinerge Effekte: Mundtrockenheit, Harnverhalt, Verstopfung",
      "Nicht bei Älteren (Sturzrisiko, Kognition)",
    ],
    mechanism: "H1-Antihistaminikum 1. Generation – zentrales anticholinerges Profil",
  },

  {
    id: "doxylamin",
    name: "Doxylamin",
    nameUS: "Doxylamine (Unisom SleepTabs)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Hoggar Night", "Schlaf-Tablinen", "Gittalun", "Unisom SleepTabs", "Nyquil"],
    category: "sleep",
    icon: "😴",
    color: "#4338ca",
    doseUnit: "mg",
    commonDoses: [12.5, 25],
    defaultDose: 25,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 3.0,
      durationHours: 9,
      halflifeHours: 10,
      bioavailability: 60,
      foodEffect: "none",
      curveType: "acute",
    },
    effects: { sleep: 78, relaxation: 60 },
    effectLabel: "Schlaf",
    maxEffectScore: 74,
    timing: { recommendation: "30 min vor dem Schlafen – max. 3 Tage" },
    warnings: [
      "Hangover-Effekt (lange HWZ!)",
      "Toleranzentwicklung",
      "Anticholinerge Nebenwirkungen",
    ],
    mechanism: "H1-Antihistaminikum 1. Generation – ähnlich wie Diphenhydramin",
  },


  // ════════════════════════════════════════
  // STIMULANZIEN & GENUSSMITTEL
  // ════════════════════════════════════════

  {
    id: "koffein",
    name: "Koffein",
    nameUS: "Caffeine",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Coffein-Tabletten", "NoDoz", "Vivarin", "ProPlus", "Guarana-Tabletten"],
    category: "stimulant",
    icon: "☕",
    color: "#f59e0b",
    doseUnit: "mg",
    commonDoses: [80, 100, 150, 200],
    defaultDose: 100,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.3,
      tmaxHours: 1.0,
      durationHours: 7,
      halflifeHours: 5,   // variiert: Raucher 3h, Schwangere 15h!
      bioavailability: 99,
      proteinBinding: 35,
      foodEffect: "minor",
      foodNote: "Nahrung verlangsamt Absorption leicht – kein klinischer Unterschied",
      curveType: "acute",
      specialNote: "T1/2 variiert stark: Raucher 3h, Pille 6-12h, Schwangerschaft 15h",
    },
    effects: { concentration: 70, energy: 75, alertness: 80, mood: 40 },
    effectLabel: "Energie & Konzentration",
    maxEffectScore: 72,
    timing: {
      recommendation: "Morgens oder früher Nachmittag",
      avoidBeforeSleepH: 8,
      maxDailyDose: "400 mg (sicher)",
    },
    warnings: [
      "⚠️ Nicht nach 14:00 Uhr (T1/2=5h → noch 25% aktiv um Mitternacht!)",
      "Toleranzentwicklung innerhalb von Wochen",
      "Entzug: Kopfschmerz, Fatigue für 1–2 Tage",
      "Erhöhte Herzfrequenz und Blutdruck",
    ],
    mechanism: "Kompetitiver Adenosin-Antagonist (A1 & A2A) – blockiert Müdigkeitssignal",
  },

  // ── Koffeinhaltige Getränke ───────────────────────────────
  // Alle teilen Koffein-PK (gleicher Mechanismus), unterscheiden sich nur in Dosis

  {
    id: "espresso",
    name: "Espresso",
    nameUS: "Espresso",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Espresso", "Doppio", "Ristretto", "Lungo"],
    category: "stimulant",
    icon: "☕",
    color: "#a16207",
    doseUnit: "mg",
    commonDoses: [63, 125],   // 1 Shot (30ml) / Doppio (60ml)
    defaultDose: 63,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.25,        // Espresso ohne Milch – schnellere Absorption
      tmaxHours: 0.75,
      durationHours: 6,
      halflifeHours: 5,
      bioavailability: 99,
      foodEffect: "minor",
      foodNote: "Espresso auf nüchternen Magen wirkt schneller und stärker. Mit Milch (Cappuccino) leicht verlangsamt.",
      curveType: "acute",
    },
    effects: { concentration: 65, energy: 70, alertness: 75 },
    effectLabel: "Energie & Fokus",
    maxEffectScore: 68,
    timing: {
      recommendation: "Morgens oder früher Nachmittag",
      avoidBeforeSleepH: 7,
      maxDailyDose: "~6 Shots (400mg Koffein)",
    },
    warnings: [
      "⚠️ Nicht nach 14:00 Uhr (T1/2=5h → schlafstörend)",
      "Auf leeren Magen kann Magenreizung verursachen",
      "Erhöhte Herzfrequenz bei Überkonsum",
    ],
    mechanism: "Kompetitiver Adenosin-Antagonist (A1 & A2A) – blockiert Müdigkeitssignal",
  },

  {
    id: "filterkaffee",
    name: "Kaffee",
    nameUS: "Coffee",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Filterkaffee", "Americano", "Schwarzer Kaffee", "Drip Coffee", "Pour Over"],
    category: "stimulant",
    icon: "☕",
    color: "#92400e",
    doseUnit: "mg",
    commonDoses: [80, 120, 160, 200],  // kleine Tasse / normale Tasse / große Tasse / Becher
    defaultDose: 120,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.3,
      tmaxHours: 1.0,
      durationHours: 7,
      halflifeHours: 5,
      bioavailability: 99,
      foodEffect: "minor",
      foodNote: "Mit Milch leicht langsamere Absorption – kein klinisch relevanter Unterschied.",
      curveType: "acute",
      specialNote: "80mg ≈ kleine Tasse (150ml) | 120mg ≈ Tasse (200ml) | 160mg ≈ großer Becher (300ml)",
    },
    effects: { concentration: 70, energy: 72, alertness: 78 },
    effectLabel: "Energie & Konzentration",
    maxEffectScore: 70,
    timing: {
      recommendation: "Morgens oder früher Nachmittag",
      avoidBeforeSleepH: 8,
      maxDailyDose: "400 mg (~3–4 Tassen)",
    },
    warnings: [
      "⚠️ Nicht nach 14:00 Uhr (T1/2=5h → noch 25% aktiv um Mitternacht!)",
      "Entzug bei regelmäßigem Konsum: Kopfschmerz, Fatigue",
      "Bei Magenempfindlichkeit: Mit Mahlzeit einnehmen",
    ],
    mechanism: "Kompetitiver Adenosin-Antagonist (A1 & A2A) – blockiert Müdigkeitssignal",
  },

  {
    id: "cappuccino",
    name: "Cappuccino",
    nameUS: "Cappuccino",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Cappuccino", "Latte Macchiato", "Flat White", "Latte", "Milchkaffee"],
    category: "stimulant",
    icon: "☕",
    color: "#b45309",
    doseUnit: "mg",
    commonDoses: [63, 80, 125],   // 1 Schuss / Standard-Cap / Doppelschuss
    defaultDose: 80,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.35,          // Milch verlangsamt minimal
      tmaxHours: 1.1,
      durationHours: 6,
      halflifeHours: 5,
      bioavailability: 99,
      foodEffect: "minor",
      foodNote: "Milchproteine binden Koffein leicht – minimale Verzögerung der Absorption.",
      curveType: "acute",
    },
    effects: { concentration: 62, energy: 65, alertness: 70 },
    effectLabel: "Energie & Wohlbefinden",
    maxEffectScore: 65,
    timing: {
      recommendation: "Morgens oder früher Nachmittag",
      avoidBeforeSleepH: 7,
      maxDailyDose: "~5 Tassen (400mg Koffein)",
    },
    warnings: [
      "⚠️ Nicht nach 14:00 Uhr",
      "Koffeingehalt je nach Zubereitung variabel",
    ],
    mechanism: "Kompetitiver Adenosin-Antagonist (A1 & A2A) – blockiert Müdigkeitssignal",
  },

  {
    id: "redbull",
    name: "Red Bull",
    nameUS: "Red Bull",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Red Bull", "Red Bull Sugarfree", "Red Bull Zero", "Red Bull Energy"],
    category: "stimulant",
    icon: "🐂",
    color: "#dc2626",
    doseUnit: "mg",
    commonDoses: [80, 114, 160],  // 250ml / 355ml / 500ml
    defaultDose: 80,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,
      durationHours: 5,
      halflifeHours: 5,
      bioavailability: 99,
      foodEffect: "minor",
      foodNote: "Kohlensäure beschleunigt Koffein-Absorption leicht. Auf nüchternen Magen stärker.",
      curveType: "acute",
      specialNote: "250ml = 80mg Koffein + 1000mg Taurin + B-Vitamine",
    },
    effects: { concentration: 65, energy: 78, alertness: 75 },
    effectLabel: "Energie & Ausdauer",
    maxEffectScore: 70,
    timing: {
      recommendation: "Vor Sport oder am Morgen",
      avoidBeforeSleepH: 6,
      maxDailyDose: "400mg Koffein (ca. 5 Dosen 250ml)",
    },
    warnings: [
      "⚠️ Nicht mit Alkohol mischen – maskiert Intoxikation!",
      "Nicht nach 15:00 Uhr bei Schlafproblemen",
      "Zuckerhaltige Variante: hoher Zuckergehalt (27g/250ml)",
      "Kinder und Schwangere: nicht empfohlen",
    ],
    mechanism: "Koffein: Adenosin-Antagonist | Taurin: membranstabilisierend, kardioprotektiv",
  },

  {
    id: "monster",
    name: "Monster Energy",
    nameUS: "Monster Energy",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Monster", "Monster Ultra", "Monster Zero", "Monster Assault", "Reign"],
    category: "stimulant",
    icon: "🟢",
    color: "#65a30d",
    doseUnit: "mg",
    commonDoses: [80, 160, 240],  // 250ml / 500ml / 750ml
    defaultDose: 160,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,
      durationHours: 6,
      halflifeHours: 5,
      bioavailability: 99,
      foodEffect: "minor",
      foodNote: "Auf nüchternem Magen schnellerer Onset und stärkere Wirkung.",
      curveType: "acute",
      specialNote: "500ml (Standarddose) = 160mg Koffein + 2000mg Taurin + B-Vitamine + L-Carnitin",
    },
    effects: { concentration: 65, energy: 80, alertness: 78 },
    effectLabel: "Energie & Performance",
    maxEffectScore: 72,
    timing: {
      recommendation: "Vor Sport oder am Morgen",
      avoidBeforeSleepH: 7,
      maxDailyDose: "400mg Koffein (ca. 2.5 Standarddosen 500ml)",
    },
    warnings: [
      "⚠️ 500ml-Dose = bereits 160mg Koffein – 2 Dosen erreichen Tageslimit!",
      "⚠️ Nicht mit Alkohol kombinieren",
      "Hoher Zuckergehalt in Classic-Variante (54g/500ml)",
      "Nicht nach 15:00 Uhr bei Schlafproblemen",
      "Kinder, Schwangere, Herzpatienten: nicht empfohlen",
    ],
    mechanism: "Koffein: Adenosin-Antagonist | Taurin: membranstabilisierend | L-Carnitin: Fettstoffwechsel",
  },

  {
    id: "nikotin_patch",
    name: "Nikotinpflaster",
    nameUS: "Nicotine Patch (NicoDerm CQ)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Nicorette Patch", "Niquitin", "Nicotinell", "NicoDerm CQ"],
    category: "stimulant",
    icon: "🩹",
    color: "#78716c",
    doseUnit: "mg",
    commonDoses: [7, 14, 21],
    defaultDose: 14,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 2.0,
      tmaxHours: 8.0,
      durationHours: 16,
      halflifeHours: 2,
      bioavailability: 75,
      foodEffect: "none",
      curveType: "acute",
    },
    effects: { cravingControl: 85, mood: 25, concentration: 25 },
    effectLabel: "Cravingkontrolle",
    maxEffectScore: 58,
    timing: { recommendation: "Morgens aufkleben – nach 16h entfernen" },
    warnings: [
      "⚠️ Nicht rauchen während Pflasteranwendung!",
      "Hautirritationen möglich – Stellen wechseln",
    ],
    mechanism: "Transdermales Nikotin – gleichmäßige Abgabe ohne Peak-Tal-Schwankungen",
  },

  // ── Nikotin-Konsumformen ──────────────────────────────────
  // Unterschiedliche Applikationsrouten → völlig verschiedene Kurvenformen

  {
    id: "zigarette",
    name: "Zigarette",
    nameUS: "Cigarette",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Marlboro", "Camel", "Lucky Strike", "Winston", "Philip Morris"],
    category: "stimulant",
    icon: "🚬",
    color: "#d4d4aa",
    doseUnit: "Stück",
    commonDoses: [1, 2, 3],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.03,       // ~2 min – Lunge ist schnellste Resorptionsroute
      tmaxHours: 0.17,        // ~10 min Peak
      durationHours: 1.0,     // subjektive Wirkung ~40–60 min
      halflifeHours: 2,       // Nikotin-T1/2 ~2h; Cotinin-T1/2 ~16h
      bioavailability: 90,    // pulmonale Bioverfügbarkeit
      foodEffect: "none",
      foodNote: "",
      curveType: "acute",
      specialNote: "1 Zigarette ≈ 1–2mg resorbiertes Nikotin (trotz 10–15mg Gesamtgehalt). Stechend kurze Kurve = klassisches Suchtmuster.",
    },
    effects: { cravingControl: 90, relaxation: 55, concentration: 40, mood: 35 },
    effectLabel: "Stimmung & Craving",
    maxEffectScore: 60,
    timing: {
      recommendation: "Craving-Peak tritt nach ~20 min Abstand zur letzten Zigarette auf.",
      maxPerDay: 20,
    },
    warnings: [
      "⚠️ Hohes Suchtpotenzial – körperliche Abhängigkeit innerhalb von Wochen",
      "Stark erhöhtes Risiko für Lungen-, Mund- und Kehlkopfkrebs",
      "Herz-Kreislauf: erhöhte Herzfrequenz, Blutdruckanstieg, Arteriosklerose",
      "Nikotin beschleunigt Koffeinabbau um ~50% – bei Rauchstopp: höhere Kaffeewirkung!",
      "Entzug: Reizbarkeit, Konzentrationsprobleme, starkes Craving für 2–4 Wochen",
    ],
    mechanism: "Nikotinische Acetylcholinrezeptoren (nAChR) → Dopamin-Ausschüttung im Nucleus accumbens",
  },

  {
    id: "e_zigarette",
    name: "E-Zigarette / Vape",
    nameUS: "Vape / E-Cigarette",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Vuse", "JUUL", "Elfbar", "Lost Mary", "Vozol", "Geekvape"],
    category: "stimulant",
    icon: "💨",
    color: "#7dd3fc",
    doseUnit: "Züge",
    commonDoses: [5, 10, 20],
    defaultDose: 10,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.03,       // ~2 min, ähnlich Zigarette
      tmaxHours: 0.2,         // ~12 min – minimal langsamer als Zigarette
      durationHours: 1.0,
      halflifeHours: 2,
      bioavailability: 85,    // etwas variabel je nach Gerät/Heiztemperatur
      foodEffect: "none",
      foodNote: "",
      curveType: "acute",
      specialNote: "Nikotinsalze (Salz-Nikotin in Pods) werden schneller absorbiert als Freebase-Nikotin in normalen Liquids.",
    },
    effects: { cravingControl: 88, relaxation: 50, concentration: 38 },
    effectLabel: "Stimmung & Craving",
    maxEffectScore: 58,
    timing: {
      recommendation: "10 Züge ≈ etwa 1 Zigaretten-Äquivalent (abhängig vom Nikotingehalt des Liquids).",
      maxPerDay: 200,
    },
    warnings: [
      "⚠️ Suchtpotenzial identisch mit Zigaretten – oft noch höherer Nikotingehalt (v.a. Pods/Salts)",
      "Langzeitfolgen der inhalierten Aromastoffe noch nicht vollständig erforscht",
      "Popcornlunge-Risiko bei Diacetyl-haltigen Aromen (v.a. Billigprodukte)",
      "Kein zertifiziertes Entwöhnungsmittel – Umstieg von Zigaretten, nicht Einstieg!",
      "Nikotinsalz-Pods: sehr hohe Nikotinkonzentration → schnelle Abhängigkeit",
    ],
    mechanism: "Nikotinische Acetylcholinrezeptoren (nAChR) → Dopamin-Ausschüttung; aerosolvermittelte Lungenresorption",
  },

  {
    id: "nikotinbeutel",
    name: "Nikotinbeutel",
    nameUS: "Nicotine Pouches",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Zyn", "Velo", "Nordic Spirit", "On!", "Lyft", "Skruf"],
    category: "stimulant",
    icon: "🟦",
    color: "#60a5fa",
    doseUnit: "mg",
    commonDoses: [4, 6, 8, 11],   // 4mg = leicht, 6mg = mittel, 8mg/11mg = stark
    defaultDose: 6,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.1,        // ~6 min – sublinguale/buccale Absorption
      tmaxHours: 0.5,         // ~30 min Peak
      durationHours: 1.5,     // Beutel liegt 30–60 min, dann abklingend
      halflifeHours: 2,
      bioavailability: 50,    // orale Schleimhaut: weniger effizient als Lunge
      foodEffect: "none",
      foodNote: "",
      curveType: "acute",
      specialNote: "Keine Verbrennung, kein Tabak, kein Dampf – reine Nikotinabgabe über Mundschleimhaut.",
    },
    effects: { cravingControl: 80, relaxation: 45, concentration: 35 },
    effectLabel: "Craving & Entspannung",
    maxEffectScore: 55,
    timing: {
      recommendation: "Beutel 20–40 min verwenden. Maximale Absorption in ersten 20 min.",
      maxPerDay: 15,
    },
    warnings: [
      "⚠️ Suchtpotenzial identisch mit anderen Nikotinprodukten",
      "Langzeitfolgen auf Mundschleimhaut noch in Erforschung",
      "Nicht schlucken – Nikotin im Verdauungstrakt schlechter vertragen",
      "Kinder und Jugendliche: hohe Vergiftungsgefahr bei versehentlichem Schlucken",
    ],
    mechanism: "Nikotinische Acetylcholinrezeptoren (nAChR) via buccale Schleimhautresorption",
  },

  {
    id: "alkohol",
    name: "Alkohol (Ethanol)",
    brandNames: ["Bier (~10g/Glas)", "Wein (~12g/Glas)", "Schnaps (~10g/Glas)"],
    category: "recreational",
    icon: "🍺",
    color: "#f97316",
    doseUnit: "g",
    commonDoses: [10, 20, 30],  // 1 Standardgetränk ≈ 10–15g Ethanol
    defaultDose: 10,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,    // nüchtern ~45min, mit Essen 60–90min
      durationHours: 2,   // pro ~10g Ethanol, linear
      halflifeHours: 1,   // ACHTUNG: LINEARE Kinetik! Nicht exponentiell!
      bioavailability: 100,
      proteinBinding: 0,
      foodEffect: "major",
      foodNote: "⚠️ Mit Essen: Peak halbiert sich! Proteine & Fette verlangsamen Resorption erheblich",
      curveType: "acute",
      metabolismType: "linear",  // Zero-Order-Kinetik: ~10g/h Abbau (unabhängig von Konzentration)
      specialNote: "LINEARE Kinetik: ~0.1–0.15 Promille/h Abbau (konstant, nicht exponentiell)",
    },
    effects: { relaxation: 70, disinhibition: 80, mood: 50, motorControl: -65, cognition: -50 },
    effectLabel: "Entspannung",
    maxEffectScore: 65,
    timing: { recommendation: "Mit Mahlzeit – langsamer Anstieg, gesünder" },
    warnings: [
      "⚠️ Schwere Wechselwirkungen mit fast ALLEN Medikamenten",
      "⚠️ Kein Autofahren",
      "Paracetamol + Alkohol = Leberschaden",
      "NSAIDs + Alkohol = Magenblutung",
      "Schlafmittel + Alkohol = Atemstillstandsrisiko",
      "Abhängigkeitspotential hoch",
    ],
    mechanism: "GABA-A-Agonist, NMDA-Antagonist – ZNS-Dämpfer mit biphasischem Effekt",
  },

  // ── Alkohol-Getränke ─────────────────────────────────────────
  // Jedes Getränk entspricht einer realen Portion mit berechnetem Ethanolgehalt.
  // interactionGroup: "alkohol" → erben alle Alkohol-Interaktionen automatisch.
  // Ethanol-Formel: mL × Vol% × 0.789 (Dichte) = g EtOH
  // Abbau: ~10g EtOH/h (Zero-Order). Kurvendauer ≈ EtOH_g/10 + 0.75h Anstieg.
  {
    id: "bier_klein",
    name: "Bier (0,33L)",
    nameUS: "Beer (12oz)",
    markets: ["DE", "AT", "CH", "US"],
    brandNames: ["Pils", "Lager", "Export", "IPA"],
    category: "recreational",
    icon: "🍺",
    color: "#f97316",
    doseUnit: "Glas",
    commonDoses: [1, 2, 3],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    interactionGroup: "alkohol",
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,
      durationHours: 2.0,   // ~13g EtOH → 1.3h Abbau + Anflutung
      halflifeHours: 1,
      bioavailability: 100,
      foodEffect: "major",
      foodNote: "⚠️ Mit Essen: Peak später und flacher",
      curveType: "acute",
      metabolismType: "linear",
    },
    effects: { relaxation: 55, disinhibition: 60, mood: 40, motorControl: -40 },
    effectLabel: "Entspannung",
    maxEffectScore: 42,  // ~13g EtOH (0.33L × 5% × 0.789)
    timing: {},
    warnings: [
      "0,33L Bier 5% ≈ 13g Ethanol ≈ 1,3 Standarddrinks",
      "⚠️ Kein Autofahren",
      "Kombination mit Medikamenten vermeiden",
    ],
    mechanism: "GABA-A-Agonist, NMDA-Antagonist",
  },

  {
    id: "bier_gross",
    name: "Bier (0,5L)",
    nameUS: "Beer (Pint)",
    markets: ["DE", "AT", "CH", "US"],
    brandNames: ["Maß", "Pint", "Halbe"],
    category: "recreational",
    icon: "🍺",
    color: "#f97316",
    doseUnit: "Glas",
    commonDoses: [1, 2, 3],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    interactionGroup: "alkohol",
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,
      durationHours: 2.8,   // ~20g EtOH → 2h Abbau + Anflutung
      halflifeHours: 1,
      bioavailability: 100,
      foodEffect: "major",
      foodNote: "⚠️ Mit Essen: Peak später und flacher",
      curveType: "acute",
      metabolismType: "linear",
    },
    effects: { relaxation: 65, disinhibition: 70, mood: 50, motorControl: -55 },
    effectLabel: "Entspannung",
    maxEffectScore: 58,  // ~20g EtOH (0.5L × 5% × 0.789)
    timing: {},
    warnings: [
      "0,5L Bier 5% ≈ 20g Ethanol ≈ 2 Standarddrinks",
      "⚠️ Kein Autofahren",
    ],
    mechanism: "GABA-A-Agonist, NMDA-Antagonist",
  },

  {
    id: "weissbier",
    name: "Weißbier (0,5L)",
    nameUS: "Wheat Beer (0.5L)",
    markets: ["DE", "AT", "CH"],
    brandNames: ["Weizen", "Hefeweizen", "Dunkel", "Paulaner", "Erdinger"],
    category: "recreational",
    icon: "🍺",
    color: "#f97316",
    doseUnit: "Glas",
    commonDoses: [1, 2],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    interactionGroup: "alkohol",
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,
      durationHours: 2.9,   // ~21g EtOH (5.4%)
      halflifeHours: 1,
      bioavailability: 100,
      foodEffect: "major",
      foodNote: "⚠️ Mit Essen: Peak später und flacher",
      curveType: "acute",
      metabolismType: "linear",
    },
    effects: { relaxation: 65, disinhibition: 70, mood: 50, motorControl: -55 },
    effectLabel: "Entspannung",
    maxEffectScore: 60,  // ~21g EtOH (0.5L × 5.4% × 0.789)
    timing: {},
    warnings: [
      "0,5L Weißbier 5,4% ≈ 21g Ethanol",
      "Kohlensäure beschleunigt Resorption leicht",
    ],
    mechanism: "GABA-A-Agonist, NMDA-Antagonist",
  },

  {
    id: "wein_glas",
    name: "Wein (0,2L)",
    nameUS: "Wine (7oz glass)",
    markets: ["DE", "AT", "CH", "US"],
    brandNames: ["Rotwein", "Weißwein", "Rosé", "Grauburgunder"],
    category: "recreational",
    icon: "🍷",
    color: "#c0392b",
    doseUnit: "Glas",
    commonDoses: [1, 2, 3],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    interactionGroup: "alkohol",
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,
      durationHours: 2.7,   // ~19g EtOH (0.2L × 12%)
      halflifeHours: 1,
      bioavailability: 100,
      foodEffect: "major",
      foodNote: "⚠️ Mit Essen: deutlich langsamere Resorption, niedrigerer Peak",
      curveType: "acute",
      metabolismType: "linear",
    },
    effects: { relaxation: 65, disinhibition: 68, mood: 55, motorControl: -50 },
    effectLabel: "Entspannung",
    maxEffectScore: 55,  // ~19g EtOH
    timing: { recommendation: "Zum Essen – Resorption verlangsamt" },
    warnings: [
      "0,2L Wein 12% ≈ 19g Ethanol",
      "⚠️ Kein Autofahren",
    ],
    mechanism: "GABA-A-Agonist, NMDA-Antagonist",
  },

  {
    id: "wein_gross",
    name: "Wein (0,25L)",
    nameUS: "Wine (9oz)",
    markets: ["DE", "AT", "CH"],
    brandNames: ["Viertel", "Viertele", "Achterl", "Schoppen"],
    category: "recreational",
    icon: "🍷",
    color: "#c0392b",
    doseUnit: "Glas",
    commonDoses: [1, 2],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    interactionGroup: "alkohol",
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,
      durationHours: 3.1,   // ~24g EtOH
      halflifeHours: 1,
      bioavailability: 100,
      foodEffect: "major",
      foodNote: "⚠️ Mit Essen: Peak deutlich flacher",
      curveType: "acute",
      metabolismType: "linear",
    },
    effects: { relaxation: 68, disinhibition: 72, mood: 58, motorControl: -58 },
    effectLabel: "Entspannung",
    maxEffectScore: 65,  // ~24g EtOH
    timing: {},
    warnings: [
      "0,25L Wein 12% ≈ 24g Ethanol ≈ 2,4 Standarddrinks",
    ],
    mechanism: "GABA-A-Agonist, NMDA-Antagonist",
  },

  {
    id: "sekt_glas",
    name: "Sekt / Prosecco (0,1L)",
    nameUS: "Sparkling Wine",
    markets: ["DE", "AT", "CH", "US"],
    brandNames: ["Sekt", "Prosecco", "Champagner", "Cava"],
    category: "recreational",
    icon: "🥂",
    color: "#f8d56b",
    doseUnit: "Glas",
    commonDoses: [1, 2, 3],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    interactionGroup: "alkohol",
    pk: {
      onsetHours: 0.15,   // Kohlensäure beschleunigt Magenentleerung
      tmaxHours: 0.5,     // schnellerer Peak durch Kohlensäure
      durationHours: 1.5,
      halflifeHours: 1,
      bioavailability: 100,
      foodEffect: "moderate",
      foodNote: "Kohlensäure beschleunigt Resorption – auch mit Essen schnellerer Onset",
      curveType: "acute",
      metabolismType: "linear",
    },
    effects: { relaxation: 45, disinhibition: 50, mood: 45, motorControl: -30 },
    effectLabel: "Entspannung",
    maxEffectScore: 30,  // ~9g EtOH (0.1L × 11% × 0.789)
    timing: {},
    warnings: [
      "0,1L Sekt 11% ≈ 9g Ethanol",
      "💡 Kohlensäure beschleunigt Resorption – wirkt schneller als Wein",
    ],
    mechanism: "GABA-A-Agonist, NMDA-Antagonist; CO₂ beschleunigt Magenentleerung",
  },

  {
    id: "shot",
    name: "Shot / Schnaps (4cl)",
    nameUS: "Shot (1.5oz)",
    markets: ["DE", "AT", "CH", "US"],
    brandNames: ["Vodka", "Whisky", "Tequila", "Rum", "Gin", "Korn", "Obstler"],
    category: "recreational",
    icon: "🥃",
    color: "#e67e22",
    doseUnit: "Shot",
    commonDoses: [1, 2, 3],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    interactionGroup: "alkohol",
    pk: {
      onsetHours: 0.2,
      tmaxHours: 0.6,    // Hochprozentiges: schnellerer Peak nüchtern
      durationHours: 1.8,
      halflifeHours: 1,
      bioavailability: 100,
      foodEffect: "major",
      foodNote: "⚠️ Nüchtern: drastisch schnellerer Anstieg, höherer Peak",
      curveType: "acute",
      metabolismType: "linear",
    },
    effects: { relaxation: 55, disinhibition: 65, mood: 45, motorControl: -50 },
    effectLabel: "Entspannung",
    maxEffectScore: 45,  // ~13g EtOH (4cl × 40% × 0.789)
    timing: {},
    warnings: [
      "4cl Schnaps 40% ≈ 13g Ethanol",
      "⚠️ Schneller Anstieg – Risiko der Unterschätzung",
      "Mehrere Shots in kurzer Zeit: hohe Intoxikationsgefahr",
    ],
    mechanism: "GABA-A-Agonist, NMDA-Antagonist; hochprozentig = schnellere Resorption",
  },

  {
    id: "longdrink",
    name: "Longdrink / Cocktail",
    nameUS: "Cocktail / Mixed Drink",
    markets: ["DE", "AT", "CH", "US"],
    brandNames: ["Gin Tonic", "Vodka Cola", "Cuba Libre", "Mojito", "Aperol Spritz"],
    category: "recreational",
    icon: "🍹",
    color: "#e74c3c",
    doseUnit: "Glas",
    commonDoses: [1, 2, 3],
    defaultDose: 1,
    prescription: false,
    controlled: false,
    interactionGroup: "alkohol",
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,
      durationHours: 2.5,   // ~15–20g EtOH je nach Rezept
      halflifeHours: 1,
      bioavailability: 100,
      foodEffect: "moderate",
      foodNote: "Zucker & Mixgetränke verlangsamen Resorption leicht",
      curveType: "acute",
      metabolismType: "linear",
    },
    effects: { relaxation: 60, disinhibition: 70, mood: 55, motorControl: -50 },
    effectLabel: "Entspannung",
    maxEffectScore: 52,  // ~15–20g EtOH geschätzt
    timing: {},
    warnings: [
      "Ethanolgehalt variiert stark je nach Rezept",
      "💡 Süße Mixgetränke kaschieren Alkoholgeschmack – Überdosierungsrisiko",
      "⚠️ Koffeinhaltige Mixer (z.B. Red Bull) maskieren Müdigkeit",
    ],
    mechanism: "GABA-A-Agonist, NMDA-Antagonist",
  },

  // ════════════════════════════════════════
  // ANTIHISTAMINIKA
  // ════════════════════════════════════════

  {
    id: "cetirizin",
    name: "Cetirizin",
    nameUS: "Cetirizine (Zyrtec)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Zyrtec", "Cetirizin Hexal", "Lisino", "Reactine"],
    category: "antihistamine",
    icon: "🌿",
    color: "#34d399",
    doseUnit: "mg",
    commonDoses: [10],
    defaultDose: 10,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.0,
      durationHours: 24,
      halflifeHours: 9,
      bioavailability: 70,
      proteinBinding: 93,
      foodEffect: "minor",
      curveType: "acute",
    },
    effects: { antihistamine: 92, sleep: 18 },
    effectLabel: "Antiallergisch",
    maxEffectScore: 88,
    timing: {
      recommendation: "Abends (leichte Sedierung nutzen)",
      maxPerDay: 1,
      maxDailyDose: "10 mg",
    },
    warnings: ["Leichte Sedierung möglich", "Nierenfunktion: Dosis anpassen"],
    mechanism: "H1-Antihistaminikum 2. Generation – kaum ZNS-gängig",
  },

  {
    id: "loratadin",
    name: "Loratadin",
    nameUS: "Loratadine (Claritin)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Claritin", "Clarityn", "Lorano", "Lisino Loratadin"],
    category: "antihistamine",
    icon: "🌿",
    color: "#10b981",
    doseUnit: "mg",
    commonDoses: [10],
    defaultDose: 10,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.5,
      tmaxHours: 1.5,
      durationHours: 24,
      halflifeHours: 12,
      bioavailability: 40,
      proteinBinding: 97,
      foodEffect: "moderate",
      foodNote: "Mahlzeit erhöht Bioverfügbarkeit um ~40%",
      curveType: "acute",
    },
    effects: { antihistamine: 88 },
    effectLabel: "Antiallergisch",
    maxEffectScore: 86,
    timing: { recommendation: "Mit Mahlzeit – morgens OK (nicht sedierend)" },
    warnings: ["Nicht bei Leberproblemen"],
    mechanism: "H1-Antihistaminikum 2. Generation – nicht-sedierend",
  },

  {
    id: "desloratadin",
    name: "Desloratadin",
    nameUS: "Desloratadine (Clarinex)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Aerius", "Clarinex", "Desloratadin-ratiopharm"],
    category: "antihistamine",
    icon: "🌿",
    color: "#059669",
    doseUnit: "mg",
    commonDoses: [5],
    defaultDose: 5,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 3.0,
      durationHours: 24,
      halflifeHours: 27,
      bioavailability: 75,
      foodEffect: "none",
      curveType: "acute",
    },
    effects: { antihistamine: 90 },
    effectLabel: "Antiallergisch",
    maxEffectScore: 88,
    timing: { recommendation: "1x täglich – Tageszeit flexibel" },
    warnings: ["Sehr gut verträglich"],
    mechanism: "Aktiver Metabolit von Loratadin – höhere Potenz",
  },

  {
    id: "fexofenadin",
    name: "Fexofenadin",
    nameUS: "Fexofenadine (Allegra)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Telfast", "Allegra", "Fexofenadin Stada"],
    category: "antihistamine",
    icon: "🌿",
    color: "#047857",
    doseUnit: "mg",
    commonDoses: [120, 180],
    defaultDose: 120,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 2.5,
      durationHours: 24,
      halflifeHours: 14,
      bioavailability: 33,
      foodEffect: "major",
      foodNote: "⚠️ Fruchtsäfte (Grapefruit, Orange, Apfel) reduzieren Absorption um bis zu 36%!",
      curveType: "acute",
    },
    effects: { antihistamine: 90 },
    effectLabel: "Antiallergisch",
    maxEffectScore: 87,
    timing: { recommendation: "Mit Wasser – kein Fruchtsaft!" },
    warnings: ["⚠️ Kein Grapefruit-/Orangensaft bei Einnahme!"],
    mechanism: "H1-Antihistaminikum 3. Generation – strikte Nicht-Sedierung",
  },


  // ════════════════════════════════════════
  // SUPPLEMENT / NAHRUNGSERGÄNZUNG
  // ════════════════════════════════════════

  {
    id: "vitamin_d3",
    name: "Vitamin D3",
    brandNames: ["Vigantol", "Dekristol", "D-Pearls", "Vitamin D3 5000"],
    category: "supplement",
    icon: "☀️",
    color: "#fbbf24",
    doseUnit: "IE",
    commonDoses: [1000, 2000, 4000, 5000],
    defaultDose: 2000,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 4.0,
      tmaxHours: 12.0,   // Serum-25(OH)D Peak
      durationHours: 72, // Spiegel hält Tage an
      halflifeHours: 720, // T1/2 von 25-OH-D3: ~3 Wochen!
      bioavailability: 60,
      proteinBinding: 100,
      foodEffect: "major",
      foodNote: "⚠️ Fetthaltige Mahlzeit NOTWENDIG – Absorption um bis zu 50% besser!",
      curveType: "acute",
    },
    effects: { energy: 35, immunity: 80, mood: 30, boneHealth: 90 },
    effectLabel: "Energie & Immunsystem",
    maxEffectScore: 42,
    timing: {
      recommendation: "Morgens mit fettreicher Mahlzeit (z.B. Avocado, Nüsse, Eier)",
      maxPerDay: 1,
      maxDailyDose: "4000 IE (OTC-Empfehlung; höher nur mit Arztüberwachung)",
    },
    warnings: [
      "Fettreiche Mahlzeit zwingend für Aufnahme",
      "Überdosierung möglich (Hyperkalzämie) – Spiegel messen!",
      "Mit Vitamin K2 MK-7 kombinieren empfohlen",
    ],
    mechanism: "Fettlösliches Prohormon – wird zu Calcitriol aktiviert, wirkt auf >200 Gene",
  },

  {
    id: "magnesium",
    name: "Magnesium",
    brandNames: ["Magnesium Verla", "Biolectra", "MagnesiumDiasporal", "Magnesiumglycinat"],
    category: "supplement",
    icon: "🪨",
    color: "#a78bfa",
    doseUnit: "mg",
    commonDoses: [150, 200, 300, 400],
    defaultDose: 300,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 2.5,
      durationHours: 8,
      halflifeHours: 4,
      bioavailability: 35,  // variiert stark nach Form:
      bioavailabilityNote: "Glycinat ~40%, Citrat ~30%, Malat ~30%, Oxid ~4%!",
      foodEffect: "none",
      foodNote: "Mit oder ohne Mahlzeit – Glycinat/Citrat besser verträglich mit Essen",
      curveType: "acute",
    },
    effects: { relaxation: 55, sleep: 50, muscleRelax: 70, stressReduction: 45 },
    effectLabel: "Entspannung & Schlaf",
    maxEffectScore: 57,
    timing: {
      recommendation: "Abends – Muskelentspannung und Schlafförderung",
      maxPerDay: 2,
      maxDailyDose: "400 mg (elementares Mg)",
    },
    warnings: [
      "Magnesiumoxid: schlechteste Bioverfügbarkeit (nur ~4%)!",
      "Magnesiumglycinat: beste Verträglichkeit, kaum Durchfall",
      "Hohe Einzeldosis → Durchfall (osmotischer Effekt)",
    ],
    mechanism: "Cofaktor in >300 Enzymsystemen – reguliert NMDA-Rezeptoren, Muskelkontraktion",
  },

  {
    id: "l_theanin",
    name: "L-Theanin",
    brandNames: ["Suntheanine", "L-Theanin 200", "Now L-Theanin"],
    category: "supplement",
    icon: "🍃",
    color: "#4ade80",
    doseUnit: "mg",
    commonDoses: [100, 200, 400],
    defaultDose: 200,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.5,
      durationHours: 6,
      halflifeHours: 1.5,
      bioavailability: 60,
      proteinBinding: 0,
      foodEffect: "none",
      curveType: "acute",
    },
    effects: { relaxation: 65, concentration: 50, stressReduction: 62, sleep: 28 },
    effectLabel: "Fokus & Entspannung",
    maxEffectScore: 60,
    timing: { recommendation: "Morgens mit Koffein (1:2-Ratio) – oder vor Schlaf" },
    warnings: ["Sehr gut verträglich", "Bei >800mg/Tag kaum Sicherheitsdaten"],
    mechanism: "Glutamat-Antagonist – erhöht Alpha-Wellen, senkt Kortisol, beruhigt ohne Sedierung",
  },

  {
    id: "vitamin_b12",
    name: "Vitamin B12",
    brandNames: ["Methylcobalamin", "Neurobion", "B12 Ankermann", "Vitamin B12 1000"],
    category: "supplement",
    icon: "🔴",
    color: "#f87171",
    doseUnit: "µg",
    commonDoses: [500, 1000, 5000],
    defaultDose: 1000,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 8.0,
      durationHours: 24,
      halflifeHours: 360,   // sehr lang – Leberspeicherung
      bioavailability: 1.2, // oral (passiv): bei 1mg ~12µg absorbiert!
      bioavailabilityNote: "Bei 1000µg oral: nur ~10–12µg tatsächlich absorbiert (intrinsic factor gesättigt bei ~1.5µg)",
      foodEffect: "none",
      curveType: "acute",
    },
    effects: { energy: 42, mood: 32, neurology: 90, cognition: 38 },
    effectLabel: "Energie & Nerven",
    maxEffectScore: 38,
    timing: {
      recommendation: "Morgens – unabhängig von Mahlzeiten",
      maxPerDay: 1,
    },
    warnings: [
      "Hohe orale Dosen nötig (≥1000µg) aufgrund geringer Absorption",
      "Bei nachgewiesenem Mangel: Injektion effektiver",
      "Methylcobalamin > Cyanocobalamin (besser bioverfügbar)",
    ],
    mechanism: "Coenzym in Methylierungsreaktionen & Nervenmyelinsynthese",
  },

  {
    id: "omega3",
    name: "Omega-3 (EPA/DHA)",
    brandNames: ["Omacor", "Norsan Total Omega-3", "WildKraft", "Nordic Naturals"],
    category: "supplement",
    icon: "🐟",
    color: "#22d3ee",
    doseUnit: "mg",
    commonDoses: [1000, 2000, 3000],
    defaultDose: 2000,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 2.0,
      tmaxHours: 6.0,
      durationHours: 24,
      halflifeHours: 60,
      bioavailability: 70,
      foodEffect: "major",
      foodNote: "⚠️ Fetthaltige Mahlzeit ERFORDERLICH – Absorption verdoppelt sich!",
      curveType: "acute",
      effectOnset: "Anti-entzündliche Wirkung nach 8–12 Wochen sichtbar",
    },
    effects: { mood: 35, inflammation: 55, cardiovascular: 62, cognition: 32 },
    effectLabel: "Entzündungshemmung",
    maxEffectScore: 40,
    timing: { recommendation: "Zu fettreicher Mahlzeit (z.B. Mittagessen)" },
    warnings: [
      "Fettreiche Mahlzeit zwingend!",
      "Blutverdünnende Wirkung bei hohen Dosen (>3g EPA/DHA/Tag)",
      "Qualität wichtig: FFA- oder rTG-Form bevorzugen",
    ],
    mechanism: "EPA/DHA hemmen LOX/COX, modulieren Eicosanoidproduktion",
  },

  {
    id: "zink",
    name: "Zink",
    brandNames: ["Zinkorot 25", "Zink Verla", "Unizink 50"],
    category: "supplement",
    icon: "🛡️",
    color: "#a3e635",
    doseUnit: "mg",
    commonDoses: [10, 15, 25, 50],
    defaultDose: 25,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 3.0,
      durationHours: 10,
      halflifeHours: 650,  // Gewebespeicherung
      bioavailability: 25,
      foodEffect: "major",
      foodNote: "Nüchtern ODER mit tierischem Protein einnehmen. Phytate (Getreide, Hülsenfrüchte) blockieren Aufnahme stark!",
      curveType: "acute",
    },
    effects: { immunity: 80, wound: 65, testosterone: 30 },
    effectLabel: "Immunsystem",
    maxEffectScore: 45,
    timing: {
      recommendation: "Nüchtern oder mit Fleisch/Fisch – nicht mit Pflanzenkost",
      maxDailyDose: "25 mg (OTC-Empfehlung)",
    },
    warnings: [
      "Nüchtern oder mit tierischem Protein für beste Aufnahme",
      "Nicht gleichzeitig mit Eisen oder Kalzium",
      "⚠️ >40mg/Tag über Monate → Kupfermangel möglich",
    ],
    mechanism: "Cofaktor in >300 Enzymen – essenziell für Immunzellreifung, Wundheilung",
  },

  {
    id: "eisen",
    name: "Eisen",
    brandNames: ["Ferro sanol duodenal", "Ferrum Hausmann", "Tardyferon"],
    category: "supplement",
    icon: "🔩",
    color: "#ef4444",
    doseUnit: "mg",
    commonDoses: [50, 80, 100],
    defaultDose: 100,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 2.0,
      durationHours: 12,
      halflifeHours: 6,
      bioavailability: 10,  // Eisen(II) nüchtern: ~20%, mit Essen: ~10%, Eisen(III): ~3%
      bioavailabilityNote: "Eisen(II) nüchtern mit Vit. C: ~25%. Mit Essen: ~10%. Eisen(III): ~3%",
      foodEffect: "major",
      foodNote: "⚠️ Nüchtern einnehmen + Vitamin C! Kaffee/Tee/Milch reduzieren Absorption um 60–90%!",
      curveType: "acute",
    },
    effects: { energy: 55, cognition: 45, fatigueReduction: 75 },
    effectLabel: "Energie (bei Mangel)",
    maxEffectScore: 42,
    timing: {
      recommendation: "Nüchtern, 30min vor Essen, mit Vitamin C (100–200mg)",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ Nüchtern + Vitamin C für maximale Aufnahme!",
      "⚠️ KEIN Kaffee, Tee, Milch bei Einnahme (60–90% Absorptionsverlust!)",
      "Nicht gleichzeitig mit Zink oder Calcium",
      "Magenreizung: dann mit leichter Mahlzeit (Abstriche bei Absorption)",
      "Stuhl wird schwarz – normal!",
    ],
    mechanism: "Hämoglobin-Cofaktor – essenziell für O2-Transport; Ferritin als Speicherform",
  },

  {
    id: "kreatin",
    name: "Kreatin Monohydrat",
    brandNames: ["CreaPure", "Weider Kreatin", "Allmax Kreatin"],
    category: "supplement",
    icon: "💪",
    color: "#fb923c",
    doseUnit: "g",
    commonDoses: [3, 5],
    defaultDose: 5,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.5,
      durationHours: 6,
      halflifeHours: 3,
      bioavailability: 99,
      foodEffect: "minor",
      foodNote: "Mit Kohlenhydraten: Insulin verbessert Muskelaufnahme",
      curveType: "acute",
      effectOnset: "Kraftsteigerung nach ~4 Wochen Einnahme (Phosphokreatinspeicher voll)",
    },
    effects: { strength: 80, cognition: 35, energy: 52 },
    effectLabel: "Kraft & Leistung",
    maxEffectScore: 60,
    timing: { recommendation: "Post-Workout oder morgens – Konsistenz wichtiger als Timing" },
    warnings: [
      "Ausreichend Wasser trinken (Hydration wichtig)",
      "Loading-Phase möglich: 5x 4g/Tag für 5–7 Tage",
      "Nierenfunktion beachten bei Vorerkrankung",
    ],
    mechanism: "PCr-System – erhöht intramuskuläre Phosphokreatin-Reserven für Schnellkraft",
  },

  {
    id: "ashwagandha",
    name: "Ashwagandha",
    brandNames: ["KSM-66", "Sensoril", "Withania somnifera"],
    category: "supplement",
    icon: "🌿",
    color: "#84cc16",
    doseUnit: "mg",
    commonDoses: [300, 600],
    defaultDose: 600,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 2.5,
      durationHours: 8,
      halflifeHours: 3,
      bioavailability: 50,
      foodEffect: "none",
      curveType: "acute",
      effectOnset: "Adaptogene Wirkung (Stress, Testosteron) nach 4–8 Wochen",
    },
    effects: { stressReduction: 72, sleep: 52, testosterone: 38, anxietyReduction: 65 },
    effectLabel: "Stressreduktion",
    maxEffectScore: 62,
    timing: { recommendation: "Abends oder aufgeteilt morgens/abends" },
    warnings: [
      "⚠️ Schwangerschaft: nicht einnehmen!",
      "Schilddrüsenerkrankungen: Arzt konsultieren (T3/T4-Einfluss)",
      "Autoimmunerkrankungen: Vorsicht",
    ],
    mechanism: "Withanolide – modulieren HPA-Achse, reduzieren Kortisol, adaptogene Wirkung",
  },

  {
    id: "vitamin_c",
    name: "Vitamin C",
    brandNames: ["Cebion", "Cetebe", "Redoxon", "Vitamin C 1000"],
    category: "supplement",
    icon: "🍊",
    color: "#fb923c",
    doseUnit: "mg",
    commonDoses: [250, 500, 1000],
    defaultDose: 1000,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 2.0,
      durationHours: 6,
      halflifeHours: 4,
      bioavailability: 70,  // sättigungsabhängig: bei 200mg ~90%, bei 1000mg ~70%
      foodEffect: "none",
      curveType: "acute",
    },
    effects: { immunity: 70, antioxidant: 80, ironAbsorption: 100 },
    effectLabel: "Immunsystem",
    maxEffectScore: 48,
    timing: { recommendation: "Mit Eisenpräparat – ansonsten flexibel" },
    warnings: [
      ">2000mg/Tag: Nierenstein-Risiko bei Prädisposition",
      "Wasserlöslich: Überschuss wird renal ausgeschieden",
    ],
    mechanism: "Ascorbinsäure – Kofaktor für Kollagensynthese, Antioxidans, Immunmodulator",
  },

  {
    id: "coq10",
    name: "Coenzym Q10",
    brandNames: ["Ubiquinol", "CoQ10", "Q10 forte"],
    category: "supplement",
    icon: "⚡",
    color: "#f59e0b",
    doseUnit: "mg",
    commonDoses: [100, 200, 300],
    defaultDose: 200,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 2.0,
      tmaxHours: 6.0,
      durationHours: 24,
      halflifeHours: 33,
      bioavailability: 8,   // Ubiquinon; Ubiquinol: ~3x besser
      foodEffect: "major",
      foodNote: "⚠️ Fetthaltige Mahlzeit verdoppelt Absorption! Ubiquinol > Ubiquinon",
      curveType: "acute",
    },
    effects: { energy: 48, cardiovascular: 55, antioxidant: 60 },
    effectLabel: "Zelluläre Energie",
    maxEffectScore: 45,
    timing: { recommendation: "Mit fettreicher Mahlzeit (Mittag- oder Abendessen)" },
    warnings: [
      "Fettreiche Mahlzeit essenziell!",
      "Ubiquinol bevorzugen (>40 Jahre oder bei Statineinnahme)",
    ],
    mechanism: "Mitochondrialer Elektronentransporter – ATP-Synthese, Antioxidans",
  },


  // ════════════════════════════════════════
  // HERZ & KREISLAUF
  // ════════════════════════════════════════

  {
    id: "metoprolol",
    name: "Metoprolol",
    nameUS: "Metoprolol (Lopressor / Toprol-XL)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Beloc Zok", "Metohexal", "Metoprolol-ratiopharm", "Lopressor", "Toprol-XL"],
    category: "cardiovascular",
    icon: "❤️",
    color: "#f87171",
    doseUnit: "mg",
    commonDoses: [23.75, 47.5, 95, 190],
    defaultDose: 47.5,
    prescription: true,
    controlled: false,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.5,
      durationHours: 24,  // Zok-Formulierung
      halflifeHours: 7,
      bioavailability: 40,
      proteinBinding: 12,
      foodEffect: "major",
      foodNote: "⚠️ Mit Mahlzeit: Bioverfügbarkeit deutlich erhöht – immer mit Essen!",
      curveType: "acute",
    },
    effects: { heartRateReduction: 82, bloodPressure: 72 },
    effectLabel: "Herzfrequenz ↓",
    maxEffectScore: 75,
    timing: {
      recommendation: "Morgens mit Mahlzeit – täglich zur gleichen Zeit",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ NIEMALS abrupt absetzen – gefährlicher Rebound (Hypertonie, Arrhythmie)!",
      "Nicht bei Asthma/COPD (Beta-2-Blockade)",
      "Diabetiker: Hypoglykämiesymptome werden maskiert",
    ],
    mechanism: "Kardioselektiver β1-Blocker – senkt HF, Blutdruck, Myokardanforderung",
  },

  {
    id: "ramipril",
    name: "Ramipril",
    nameUS: "Ramipril (Altace)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Delix", "Vesdil", "Ramipril Hexal", "Altace"],
    category: "cardiovascular",
    icon: "❤️",
    color: "#fca5a5",
    doseUnit: "mg",
    commonDoses: [2.5, 5, 10],
    defaultDose: 5,
    prescription: true,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 3.0,
      durationHours: 24,
      halflifeHours: 13,
      bioavailability: 28,
      foodEffect: "minor",
      curveType: "acute",
    },
    effects: { bloodPressure: 76, kidneyProtection: 72 },
    effectLabel: "Blutdruck ↓",
    maxEffectScore: 72,
    timing: { recommendation: "Morgens – täglich gleiche Zeit" },
    warnings: [
      "Kein Kaliumpräparat parallel",
      "⚠️ Nicht in der Schwangerschaft!",
      "Husten als häufige NW (ACE-Hemmer-Husten)",
      "Angioödem – sofort Arzt bei Schwellung von Lippen/Hals",
    ],
    mechanism: "ACE-Hemmer – hemmt Angiotensin-Converting-Enzyme, nephroprotektiv",
  },

  {
    id: "amlodipin",
    name: "Amlodipin",
    nameUS: "Amlodipine (Norvasc)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Norvasc", "Amlodipin Stada"],
    category: "cardiovascular",
    icon: "❤️",
    color: "#fda4af",
    doseUnit: "mg",
    commonDoses: [5, 10],
    defaultDose: 5,
    prescription: true,
    controlled: false,
    pk: {
      onsetHours: 4.0,
      tmaxHours: 8.0,
      durationHours: 24,
      halflifeHours: 35,  // sehr lange HWZ!
      bioavailability: 64,
      foodEffect: "none",
      curveType: "acute",
      specialNote: "Sehr lange HWZ – Steady-State erst nach 7–8 Tagen erreicht",
    },
    effects: { bloodPressure: 74, angina: 72 },
    effectLabel: "Blutdruck ↓",
    maxEffectScore: 70,
    timing: { recommendation: "Tageszeit flexibel – täglich gleiche Zeit" },
    warnings: [
      "Knöchelödeme häufig",
      "⚠️ Grapefruitsaft vermeiden (CYP3A4-Inhibition → erhöhter Spiegel)!",
      "Langsamer Wirkbeginn – Geduld bei Einstellung",
    ],
    mechanism: "Kalziumantagonist (Dihydropyridin) – vaskuläre Relaxation, RR-Senkung",
  },


  // ════════════════════════════════════════
  // ANTIDEPRESSIVA
  // ════════════════════════════════════════

  {
    id: "sertralin",
    name: "Sertralin",
    nameUS: "Sertraline (Zoloft)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Zoloft", "Sertralin Stada", "Gladem", "Asentra"],
    category: "antidepressant",
    icon: "🌈",
    color: "#fb923c",
    doseUnit: "mg",
    commonDoses: [25, 50, 100, 200],
    defaultDose: 50,
    prescription: true,
    controlled: false,
    pk: {
      onsetHours: null,  // Klinische Wirkung: 2–4 Wochen!
      tmaxHours: 6.0,
      durationHours: 24,
      halflifeHours: 26,
      bioavailability: 44,
      proteinBinding: 98,
      foodEffect: "major",
      foodNote: "Mit Mahlzeit: Bioverfügbarkeit um 30% höher",
      curveType: "chronic",
      effectOnset: "⚠️ Antidepressive Wirkung erst nach 2–4 Wochen! Plasma-Peak in 6h sichtbar, aber klinisch irrelevant.",
    },
    effects: { mood: 75, anxiety: 72, ocd: 70 },
    effectLabel: "Stimmung (chronisch)",
    maxEffectScore: 70,
    timing: {
      recommendation: "Morgens mit Mahlzeit – täglich gleiche Zeit",
      maxPerDay: 1,
      maxDailyDose: "200 mg",
    },
    warnings: [
      "⚠️ KEIN sofortiger Effekt – 2–4 Wochen Geduld!",
      "⚠️ NIEMALS abrupt absetzen (Absetzsyndrom)!",
      "Zu Beginn: erhöhte Suizidgedanken überwachen (Monitoring!)",
      "Kein Alkohol",
      "Nicht mit MAO-Hemmern",
    ],
    mechanism: "Selektiver Serotonin-Wiederaufnahmehemmer (SSRI)",
  },

  {
    id: "escitalopram",
    name: "Escitalopram",
    nameUS: "Escitalopram (Lexapro)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Cipralex", "Escitalopram Stada", "Lexapro"],
    category: "antidepressant",
    icon: "🌈",
    color: "#fdba74",
    doseUnit: "mg",
    commonDoses: [5, 10, 20],
    defaultDose: 10,
    prescription: true,
    controlled: false,
    pk: {
      onsetHours: null,
      tmaxHours: 5.0,
      durationHours: 24,
      halflifeHours: 30,
      bioavailability: 80,
      foodEffect: "none",
      curveType: "chronic",
      effectOnset: "Antidepressive Wirkung erst nach 2–4 Wochen",
    },
    effects: { mood: 78, anxiety: 82 },
    effectLabel: "Stimmung (chronisch)",
    maxEffectScore: 72,
    timing: { recommendation: "Morgens oder abends – täglich gleiche Zeit" },
    warnings: [
      "QT-Verlängerung bei hohen Dosen (>20mg)",
      "Absetzsyndrom – ausschleichen!",
      "Kein sofortiger Effekt",
    ],
    mechanism: "Reinster SSRI – nur S-Enantiomer des Citaloprams",
  },


  // ════════════════════════════════════════
  // MAGEN & DARM
  // ════════════════════════════════════════

  {
    id: "omeprazol",
    name: "Omeprazol",
    nameUS: "Omeprazole (Prilosec OTC)",
    markets: ["DE", "US", "AT", "CH"],
    brandNames: ["Antra", "Omep", "Losec", "Prilosec OTC", "Omeprazol-ratiopharm"],
    category: "gastro",
    icon: "🫃",
    color: "#a3e635",
    doseUnit: "mg",
    commonDoses: [10, 20, 40],
    defaultDose: 20,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 1.0,
      tmaxHours: 2.0,
      durationHours: 24,  // Irreversible Bindung → 24h trotz T1/2=1.5h!
      halflifeHours: 1.5,
      bioavailability: 40,
      foodEffect: "major",
      foodNote: "⚠️ NÜCHTERN einnehmen! 30–60 min VOR dem Frühstück. Mit Essen: bis zu 50% geringere Wirkung!",
      curveType: "acute",
      specialNote: "Irreversible H+/K+-ATPase-Hemmung → Wirkung 24h, obwohl T1/2 nur 1.5h",
    },
    effects: { acidSuppression: 92 },
    effectLabel: "Magensäurehemmung",
    maxEffectScore: 85,
    timing: {
      recommendation: "⚠️ 30–60 min VOR dem Frühstück – nüchtern!",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ Nüchtern einnehmen (30min vor dem Essen)!",
      "Langzeiteinnahme: B12-, Magnesium-, Kalzium-Mangel möglich",
      "Nicht abrupt absetzen (Rebound-Hyperazidität!)",
      "Erhöhtes Risiko für Clostridium difficile",
    ],
    mechanism: "PPI – irreversibel Hemmung der H+/K+-ATPase (Protonenpumpe) in Belegzellen",
  },

  // ─────────────────────────────────────────────────────────────
  // RECREATIONAL / SCENE DRUGS
  // ─────────────────────────────────────────────────────────────

  {
    id: "cannabis",
    name: "Cannabis (THC)",
    nameUS: "Cannabis (THC)",
    markets: ["DE", "AT", "CH", "US", "UK"],
    brandNames: ["Weed", "Gras", "Marihuana", "Hash", "Dope"],
    category: "recreational",
    icon: "🌿",
    color: "#4ade80",
    doseUnit: "mg THC",
    commonDoses: [5, 10, 20, 30],
    defaultDose: 10,
    prescription: false,
    controlled: false,
    pk: {
      onsetHours: 0.08,      // ~5 min inhaliert
      tmaxHours: 0.5,
      durationHours: 3,
      halflifeHours: 2,
      bioavailability: 25,   // inhalativ; oral ~6–10%
      foodEffect: "minor",
      foodNote: "🍽 Oral (Edibles): verzögerter Onset 1–2h, deutlich verlängerte Wirkung (6–8h). Fettreiche Nahrung erhöht Bioverfügbarkeit.",
      curveType: "acute",
    },
    effects: { euphoria: 70, relaxation: 75, cognitiveImpairment: 60, anxietyRisk: 40 },
    effectLabel: "Entspannung / Euphorie",
    maxEffectScore: 70,
    timing: {
      recommendation: "Niedrigdosierter Einstieg empfohlen – individuelle Toleranz stark variabel.",
      maxPerDay: 3,
    },
    warnings: [
      "⚠️ Fahrtüchtigkeit erheblich eingeschränkt (bis 24h nach Konsum messbar)!",
      "Psychosetrigger bei Prädisposition – bei psychiatrischer Vorgeschichte meiden",
      "Hochpotentes THC (>20%) erhöht Angst und Paranoia-Risiko",
      "Regelmäßiger Konsum kann zu Abhängigkeit und kognitivem Abbau führen",
      "Kombination mit Alkohol potenziert Beeinträchtigung stark ('Greening out')",
    ],
    mechanism: "Partialagonist an CB1/CB2-Cannabinoidrezeptoren – beeinflusst Dopamin, GABA und Glutamat",
  },

  {
    id: "mdma",
    name: "MDMA",
    nameUS: "MDMA",
    markets: ["DE", "AT", "CH", "US", "UK"],
    brandNames: ["XTC", "Ecstasy", "Molly", "E", "Pille"],
    category: "recreational",
    icon: "💊",
    color: "#f472b6",
    doseUnit: "mg",
    commonDoses: [75, 100, 125, 150],
    defaultDose: 100,
    prescription: false,
    controlled: true,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.5,
      durationHours: 5,
      halflifeHours: 8.5,
      bioavailability: 80,
      foodEffect: "minor",
      foodNote: "🍽 Nüchtern schnellerer Onset, leerer Magen reduziert Übelkeit nicht – Timing individuell.",
      curveType: "acute",
    },
    effects: { euphoria: 90, empathy: 85, energyBoost: 70, serotonin: 95, hyperthermiaRisk: 60 },
    effectLabel: "Euphorie / Empathie",
    maxEffectScore: 90,
    timing: {
      recommendation: "⚠️ Mindestabstand 4–6 Wochen zwischen Konsumereignissen (Serotonin-Erschöpfung).",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ BtMG (Betäubungsmittelgesetz) – Besitz und Konsum illegal",
      "⚠️ Serotonin-Syndrom-Risiko bei Kombination mit SSRIs/MAOIs – LEBENSGEFÄHRLICH",
      "Hyperthermie und Hyponatriämie (zu viel Wasser trinken) häufige Todesursachen",
      "Neurotoxizität bei häufigem Konsum (serotonerge Axone)",
      "Überhitzung: Pausen, kühle Umgebung, moderat trinken (500ml/h max)",
      "Herzrhythmusstörungen bei Herzvorerkrankungen",
    ],
    mechanism: "Massiver Serotonin-, Dopamin- und Noradrenalin-Ausschüttung via SERT/DAT-Reversal; MAO-Hemmer-Effekt",
  },

  {
    id: "ketamin",
    name: "Ketamin",
    nameUS: "Ketamine",
    markets: ["DE", "AT", "CH", "US", "UK"],
    brandNames: ["Ket", "Special K", "K", "Ketalar"],
    category: "recreational",
    icon: "❄️",
    color: "#818cf8",
    doseUnit: "mg",
    commonDoses: [25, 50, 75, 100],
    defaultDose: 50,
    prescription: true,
    controlled: true,
    pk: {
      onsetHours: 0.03,    // ~2 min nasal
      tmaxHours: 0.25,
      durationHours: 2,
      halflifeHours: 2.5,
      bioavailability: 45, // nasal
      foodEffect: "none",
      foodNote: "",
      curveType: "acute",
    },
    effects: { dissociation: 85, analgesia: 80, euphoria: 50, confusionRisk: 70 },
    effectLabel: "Dissoziation / Analgesie",
    maxEffectScore: 80,
    timing: {
      recommendation: "⚠️ Sichere Umgebung, sitzende oder liegende Position. Nie allein konsumieren.",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ BtMG – verschreibungspflichtig, Missbrauch illegal",
      "K-Hole: bei hoher Dosis vollständige Dissoziation und Immobilität möglich",
      "Atemdepression bei i.v.-Konsum; nasale Applikation sicherer",
      "Blasen- und Nierenschäden (Ketamin-Zystopathie) bei regelmäßigem Konsum",
      "Kein Autofahren oder Bedienen von Maschinen!",
      "⚠️ Kombination mit Alkohol oder Depressiva lebensbedrohlich",
    ],
    mechanism: "NMDA-Rezeptor-Antagonist – dissoziative Anästhesie; zusätzlich Opioid- und Sigma-Rezeptor-Aktivität",
  },

  {
    id: "kokain",
    name: "Kokain",
    nameUS: "Cocaine",
    markets: ["DE", "AT", "CH", "US", "UK"],
    brandNames: ["Koks", "Coke", "Schnee", "Charlie", "Blow"],
    category: "recreational",
    icon: "🤍",
    color: "#e2e8f0",
    doseUnit: "mg",
    commonDoses: [30, 50, 75, 100],
    defaultDose: 50,
    prescription: false,
    controlled: true,
    pk: {
      onsetHours: 0.03,   // ~2 min nasal
      tmaxHours: 0.25,
      durationHours: 1,
      halflifeHours: 1,
      bioavailability: 60, // nasal
      foodEffect: "none",
      foodNote: "",
      curveType: "acute",
    },
    effects: { euphoria: 85, energyBoost: 80, confidence: 75, cardiotoxicity: 70 },
    effectLabel: "Euphorie / Stimulation",
    maxEffectScore: 85,
    timing: {
      recommendation: "⚠️ Kurze Wirkdauer führt zu Redosing-Drang – starkes Abhängigkeitspotenzial.",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ BtMG – Besitz und Konsum illegal",
      "Hohes kardiovaskuläres Risiko: Herzinfarkt, Arrhythmie, Schlaganfall",
      "Nasenscheidewandschäden bei nasalem Konsum",
      "Cocaethylen-Bildung mit Alkohol – dreifach erhöhtes Herzinfarktrisiko",
      "Hohes physisches und psychisches Abhängigkeitspotenzial",
      "Crack (geraucht): deutlich schnellerer Onset, massiv höheres Suchtpotenzial",
    ],
    mechanism: "Dopamin-Wiederaufnahmehemmer (DAT-Blocker) + Noradrenalin/Serotonin; lokales Anästhetikum (Na-Kanal)",
  },

  {
    id: "speed",
    name: "Speed (Amphetamin)",
    nameUS: "Speed (Amphetamine)",
    markets: ["DE", "AT", "CH", "US", "UK"],
    brandNames: ["Speed", "Pep", "Amphetaminsulfat", "Base", "Whizz"],
    category: "recreational",
    icon: "⚡",
    color: "#fbbf24",
    doseUnit: "mg",
    commonDoses: [10, 20, 30, 50],
    defaultDose: 20,
    prescription: false,
    controlled: true,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 2,
      durationHours: 6,
      halflifeHours: 11,
      bioavailability: 75,
      foodEffect: "minor",
      foodNote: "🍽 Auf leeren Magen schnellerer Onset.",
      curveType: "acute",
    },
    effects: { euphoria: 75, energyBoost: 85, focus: 70, appetite: -80, sleepDisruption: 85 },
    effectLabel: "Stimulation / Energie",
    maxEffectScore: 80,
    timing: {
      recommendation: "⚠️ Lange Halbwertszeit – nach 18 Uhr keine Einnahme, Schlaf für >12h gestört.",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ BtMG – Besitz und Konsum illegal",
      "Lange Halbwertszeit (11h): Schlaf für Nacht nach Konsum nahezu unmöglich",
      "Amphetaminpsychose bei Überdosierung oder Schlafentzug",
      "Hyperthermie, Herzrasen, Hypertonie",
      "Regelmäßiger Konsum: Toleranz und physische Abhängigkeit",
      "⚠️ Gestreckte Straßenware enthält oft unbekannte Substanzen – Testkits verwenden",
    ],
    mechanism: "Dopamin/Noradrenalin-Freisetzung via DAT/NET-Reversal; VMAT2-Hemmung; MAO-Hemmung bei hohen Dosen",
  },

  {
    id: "ghb",
    name: "GHB",
    nameUS: "GHB",
    markets: ["DE", "AT", "CH", "US", "UK"],
    brandNames: ["Liquid Ecstasy", "GBL", "Fantasy", "Liquid E", "G"],
    category: "recreational",
    icon: "💧",
    color: "#38bdf8",
    doseUnit: "g",
    commonDoses: [1, 1.5, 2, 2.5],
    defaultDose: 1.5,
    prescription: false,
    controlled: true,
    pk: {
      onsetHours: 0.25,
      tmaxHours: 0.75,
      durationHours: 3,
      halflifeHours: 0.5,
      bioavailability: 95,
      foodEffect: "major",
      foodNote: "⚠️ Essen verzögert Onset deutlich – auf leeren Magen deutlich stärker und schneller!",
      curveType: "acute",
    },
    effects: { euphoria: 75, relaxation: 80, disinhibition: 70, respiratoryRisk: 85 },
    effectLabel: "Entspannung / Euphorie",
    maxEffectScore: 75,
    timing: {
      recommendation: "⚠️ Sehr schmales therapeutisches Fenster: 0.5g Unterschied zwischen Wirkung und Überdosis!",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ BtMG – Besitz und Konsum illegal",
      "⚠️ KRITISCH: Kombination mit Alkohol oder anderen Depressiva → Atemstillstand, Tod",
      "Extrem schmale Dosisfenster – geringste Überdosierung führt zu Bewusstlosigkeit",
      "GBL (Prodrug) ist ~2× potenter als GHB – Umrechnung beachten!",
      "K.O.-Tropfen-Missbrauch: Nie Getränk unbeaufsichtigt lassen",
      "Physische Abhängigkeit bereits nach wenigen Wochen täglichen Konsums",
      "Entzugssyndrom lebensbedrohlich (wie Alkohol-Entzug)",
    ],
    mechanism: "GHB-Rezeptor-Agonist + GABA-B-Agonist – endogenes Neuromodulatoranalogon",
  },

  {
    id: "psilocybin",
    name: "Psilocybin",
    nameUS: "Psilocybin",
    markets: ["DE", "AT", "CH", "US", "UK"],
    brandNames: ["Magic Mushrooms", "Pilze", "Zauberpilze", "Shrooms", "Psilo"],
    category: "recreational",
    icon: "🍄",
    color: "#a78bfa",
    doseUnit: "g",
    commonDoses: [1, 2, 3, 5],
    defaultDose: 2,
    prescription: false,
    controlled: true,
    pk: {
      onsetHours: 0.5,
      tmaxHours: 1.5,
      durationHours: 5,
      halflifeHours: 1.5,   // Psilocin (aktiver Metabolit)
      bioavailability: 52,
      foodEffect: "moderate",
      foodNote: "🍽 Nüchtern: schnellerer und intensiverer Onset. Auf leeren Magen kann Übelkeit verstärkt sein.",
      curveType: "acute",
    },
    effects: { hallucination: 85, euphoria: 65, introspection: 80, anxietyRisk: 50 },
    effectLabel: "Psychedelisch / Introspektiv",
    maxEffectScore: 80,
    timing: {
      recommendation: "⚠️ Set & Setting entscheidend. Immer mit nüchternem Verstand und Vertrauensperson.",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ BtMG – Besitz und Konsum illegal",
      "Psychotischer Ausbruch bei Prädisposition möglich – kontraindiziert bei Familienanamnese Psychose",
      "'Bad Trip': intensive Angst, Panikattacken – sichere Umgebung und Trip-Sitter wichtig",
      "HPPD (Hallucinogen Persisting Perception Disorder) selten aber möglich",
      "Keine physische Abhängigkeit; schnelle Toleranzentwicklung (Cross-Toleranz mit LSD)",
      "Keine Kombination mit Lithium (Krampfanfall-Risiko)",
    ],
    mechanism: "Prodrug zu Psilocin – 5-HT2A-Agonist (serotonerge Halluzinogene); frontale Kortex-Aktivierung",
  },

  {
    id: "lsd",
    name: "LSD",
    nameUS: "LSD",
    markets: ["DE", "AT", "CH", "US", "UK"],
    brandNames: ["Acid", "LSD-25", "Trips", "Blotter", "Lysergid"],
    category: "recreational",
    icon: "🔮",
    color: "#c084fc",
    doseUnit: "µg",
    commonDoses: [50, 75, 100, 150],
    defaultDose: 75,
    prescription: false,
    controlled: true,
    pk: {
      onsetHours: 0.75,
      tmaxHours: 3,
      durationHours: 10,
      halflifeHours: 3.5,
      bioavailability: 71,
      foodEffect: "minor",
      foodNote: "🍽 Essen kann Onset leicht verzögern, hat jedoch kaum Einfluss auf Intensität.",
      curveType: "acute",
    },
    effects: { hallucination: 90, synaesthesia: 80, euphoria: 65, timeDistortion: 85, anxietyRisk: 55 },
    effectLabel: "Psychedelisch / Visionär",
    maxEffectScore: 90,
    timing: {
      recommendation: "⚠️ Extrem lange Wirkdauer (10–12h). Nur starten, wenn ganzer Tag frei. Nie allein.",
      maxPerDay: 1,
    },
    warnings: [
      "⚠️ BtMG – Besitz und Konsum illegal",
      "Sehr geringe aktive Dosis (µg-Bereich) – Überdosierungsrisiko durch schlecht dosierte Straßenware",
      "Psychotischer Ausbruch bei genetischer Prädisposition",
      "HPPD (Hallucinogen Persisting Perception Disorder) möglich",
      "Lange Wirkdauer: Kein Nachtschlaf bei Konsum nach 10 Uhr",
      "Keine physische Abhängigkeit; sehr schnelle Kreuztoleranz mit Psilocybin",
      "Keine Kombination mit Lithium (Krampfanfall-Risiko)",
    ],
    mechanism: "Potenter 5-HT2A-Partialagonist – verändert thalamo-kortikale Filterfunktion; Dopamin-D2-Aktivität",
  },

];


// ─────────────────────────────────────────────────────────────
// WECHSELWIRKUNGS-MATRIX
// ─────────────────────────────────────────────────────────────
// type: "synergy" | "antagonist" | "risk" | "mixed"
// severity: "low" | "moderate" | "high" | "critical"

export const INTERACTIONS = [

  // ── Synergien ──────────────────────────────────────────────
  { a:"koffein",     b:"l_theanin",    type:"synergy",    severity:"low",      note:"Optimale Kombination: L-Theanin dämpft Nervosität/Jitteriness des Koffeins, erhält Fokus. Idealratio 1:2 (100mg Koffein: 200mg L-Theanin)" },
  { a:"vitamin_d3",  b:"magnesium",    type:"synergy",    severity:"low",      note:"Magnesium ist essenzieller Cofaktor für Vitamin-D-Aktivierung zu Calcitriol – gegenseitig verstärkend" },
  { a:"vitamin_d3",  b:"omega3",       type:"synergy",    severity:"low",      note:"Omega-3-Fettsäuren verbessern Vitamin-D-Rezeptorsensitivität" },
  { a:"eisen",       b:"vitamin_c",    type:"synergy",    severity:"high",     note:"⭐ Vitamin C reduziert Fe³⁺ zu Fe²⁺ und hemmt Phytate – Eisenabsorption bis zu 3x besser! Immer gemeinsam einnehmen" },
  { a:"zink",        b:"vitamin_c",    type:"synergy",    severity:"low",      note:"Vitamin C unterstützt immunologische Zink-Wirkung" },
  { a:"l_theanin",   b:"magnesium",    type:"synergy",    severity:"low",      note:"Beide wirken GABAerg entspannend – additive Wirkung am Abend" },
  { a:"kreatin",     b:"vitamin_d3",   type:"synergy",    severity:"low",      note:"Vitamin D verbessert Kreatinaufnahme in Muskelzellen" },
  { a:"mph_ir",      b:"l_theanin",    type:"synergy",    severity:"low",      note:"L-Theanin kann Rebound-Effekt und Nervosität bei MPH reduzieren" },
  { a:"omega3",      b:"vitamin_d3",   type:"synergy",    severity:"low",      note:"Fischöl verbessert Absorption des fettlöslichen Vitamin D" },
  { a:"ashwagandha", b:"magnesium",    type:"synergy",    severity:"low",      note:"Beide reduzieren Kortisolspiegel und unterstützen Schlaf" },

  // ── Antagonismen ──────────────────────────────────────────
  { a:"koffein",     b:"melatonin",    type:"antagonist", severity:"moderate", note:"Koffein hemmt Melatonin-Ausschüttung und antagonisiert Adenosin-Signal. Mindestens 6–8h Abstand vor Schlaf" },
  { a:"omeprazol",   b:"eisen",        type:"antagonist", severity:"moderate", note:"Magensäure nötig für Fe³⁺→Fe²⁺-Reduktion. PPIs reduzieren Eisenabsorption um ~40%. 2h Abstand halten" },
  { a:"omeprazol",   b:"vitamin_b12",  type:"antagonist", severity:"moderate", note:"Langzeit-PPI: B12-Resorption erfordert Magensäure und Intrinsic Factor. Regelmäßig B12-Spiegel messen" },
  { a:"omeprazol",   b:"magnesium",    type:"antagonist", severity:"moderate", note:"Langzeit-PPI → Hypomagnesiämie durch renalen Mg-Verlust" },
  { a:"eisen",       b:"zink",         type:"antagonist", severity:"moderate", note:"Kompetitive Absorption am DMT1-Transporter – mindestens 2h Abstand zwischen Einnahmen" },
  { a:"eisen",       b:"magnesium",    type:"antagonist", severity:"low",      note:"Gegenseitige Absorptionshemmung bei gleichzeitiger Einnahme" },
  { a:"eisen",       b:"cetirizin",    type:"antagonist", severity:"low",      note:"Eisen kann Absorption einiger Antihistaminika reduzieren" },
  { a:"metoprolol",  b:"koffein",      type:"antagonist", severity:"low",      note:"Koffein kann Betablocker-Wirkung (HF-Senkung) abschwächen" },
  { a:"aspirin",     b:"ibuprofen",    type:"antagonist", severity:"moderate", note:"⚠️ Ibuprofen blockiert kardioprotektiven Plättchenhemmeffekt von ASS 100 – 2h Abstand halten (zuerst ASS, dann IBU)" },

  // ── Risiken (moderat) ─────────────────────────────────────
  { a:"ibuprofen",   b:"alkohol",      type:"risk",       severity:"moderate", note:"Erhöhtes Magenblutungsrisiko – NSAID + Alkohol möglichst vermeiden" },
  { a:"ibuprofen",   b:"ramipril",     type:"risk",       severity:"moderate", note:"NSAIDs reduzieren antihypertensive Wirkung und erhöhen akutes Nierenversagen-Risiko" },
  { a:"ibuprofen",   b:"metoprolol",   type:"risk",       severity:"low",      note:"NSAIDs können Betablocker-Wirkung abschwächen" },
  { a:"cetirizin",   b:"alkohol",      type:"risk",       severity:"moderate", note:"Verstärkte ZNS-Dämpfung und Sedierung" },
  { a:"amlodipin",   b:"alkohol",      type:"risk",       severity:"moderate", note:"Alkohol potenziert Blutdruckabfall – Synkopenrisiko" },
  { a:"lisdex",      b:"alkohol",      type:"risk",       severity:"moderate", note:"Alkohol maskiert Amphetamin-Wirkung – erhöhte Intoxikationsgefahr ohne subjektive Warnsignale" },
  { a:"mph_ir",      b:"alkohol",      type:"risk",       severity:"moderate", note:"Alkohol-MPH-Kombination: veränderte Pharmakokinetik, erhöhte HF, Schlaf stark beeinträchtigt" },
  { a:"sertralin",   b:"alkohol",      type:"risk",       severity:"moderate", note:"Verstärkte ZNS-Depression, verminderte antidepressive Wirkung" },
  { a:"escitalopram",b:"alkohol",      type:"risk",       severity:"moderate", note:"Verstärkte ZNS-Depression" },
  { a:"melatonin",   b:"alkohol",      type:"risk",       severity:"moderate", note:"Alkohol unterdrückt Melatoninausschüttung und stört Schlafarchitektur" },
  // Nikotin ↔ Koffein (alle Applikationsformen)
  { a:"nikotin_patch", b:"koffein",      type:"mixed", severity:"low",      note:"Nikotin induziert CYP1A2 → Koffeinabbau ~50% schneller. Bei Rauchstopp: plötzlich deutlich höhere Koffeinspiegel – Dosis ggf. reduzieren." },
  { a:"zigarette",     b:"koffein",      type:"mixed", severity:"moderate", note:"Rauchen induziert CYP1A2 stark → Koffein wird ~50% schneller abgebaut. Raucher brauchen mehr Koffein für gleiche Wirkung. Nach Rauchstopp: Koffeinwirkung spürbar stärker – Herzrasen, Schlafstörungen möglich." },
  { a:"zigarette",     b:"espresso",     type:"mixed", severity:"moderate", note:"Rauchen beschleunigt Koffeinabbau (~50%). Espresso wirkt kürzer und schwächer. Nach Rauchstopp: Espresso-Wirkung plötzlich deutlich stärker." },
  { a:"zigarette",     b:"filterkaffee", type:"mixed", severity:"moderate", note:"Rauchen induziert CYP1A2 → Koffein aus Kaffee wird schneller metabolisiert. Typisch: Raucher trinken mehr Kaffee für gleichen Effekt." },
  { a:"zigarette",     b:"redbull",      type:"mixed", severity:"moderate", note:"Rauchen + Energy Drink: Koffeinabbau beschleunigt, kardiovaskuläre Belastung kumulativ erhöht (Herzfrequenz, Blutdruck)." },
  { a:"e_zigarette",   b:"koffein",      type:"mixed", severity:"low",      note:"Nikotin aus Vaping induziert CYP1A2 – Koffeinabbau beschleunigt ähnlich wie bei Zigaretten, Ausmaß dosisabhängig." },
  { a:"e_zigarette",   b:"espresso",     type:"mixed", severity:"low",      note:"Nikotin (Vape) + Espresso: leicht beschleunigter Koffeinabbau. Beide stimulierend – additive Herzfrequenzerhöhung möglich." },
  { a:"nikotinbeutel", b:"koffein",      type:"mixed", severity:"low",      note:"Nikotinbeutel induzieren CYP1A2 schwächer als Rauchen – geringerer Effekt auf Koffeinabbau, aber bei hohem Konsum relevant." },

  // ── Kritische Risiken ─────────────────────────────────────
  { a:"paracetamol", b:"alkohol",      type:"risk",       severity:"critical", note:"⚠️ KRITISCH: Beide belasten CYP2E1 mit toxischem NAPQI-Metabolit. Lebertoxisch! Bei regelmäßigem Alkohol: Paracetamol kontraindiziert" },
  { a:"diphenhydramin",b:"alkohol",    type:"risk",       severity:"critical", note:"⚠️ KRITISCH: Massive gegenseitige ZNS-Dämpfung – Atemstillstandsrisiko!" },
  { a:"doxylamin",   b:"alkohol",      type:"risk",       severity:"critical", note:"⚠️ KRITISCH: Lebensbedrohliche Atemdepression möglich" },
  { a:"sertralin",   b:"tramadol",     type:"risk",       severity:"critical", note:"⚠️ KRITISCH: Serotoninsyndrom-Risiko (Fieber, Klonus, Agitation) – Kombination kontraindiziert" },

  // ── Neu ergänzte Interaktionen ────────────────────────────
  { a:"cetirizin",   b:"diphenhydramin", type:"risk",     severity:"high",     note:"⚠️ Zwei H1-Antihistaminika kombiniert: additive anticholinerge Toxizität (Mundtrockenheit, Harnverhalt, Verwirrtheit), verstärkte Sedierung. Kein Autofahren! Kombination vermeiden – besonders bei älteren Personen (Delir-Risiko)." },
  { a:"loratadin",   b:"diphenhydramin", type:"risk",     severity:"moderate", note:"Zwei Antihistaminika: additive Sedierung möglich, anticholinerge Effekte kumulieren. Kombination nicht empfohlen." },
  { a:"doxylamin",   b:"diphenhydramin", type:"risk",     severity:"high",     note:"⚠️ Zwei sedierende Antihistaminika: stark additive ZNS-Dämpfung und anticholinerge Last. Kombination kontraindiziert." },
  { a:"diphenhydramin",b:"melatonin",    type:"risk",     severity:"moderate", note:"Additive Sedierung – kann Hangover am nächsten Tag verstärken. Niedrigste wirksame Dosis wählen." },
  { a:"sertralin",   b:"escitalopram",   type:"risk",     severity:"critical", note:"⚠️ KRITISCH: Zwei SSRIs kombiniert – massives Serotoninsyndrom-Risiko. Absolute Kontraindikation." },

  // ── Adderall interactions ─────────────────────────────────
  { a:"adderall",    b:"alkohol",         type:"risk",     severity:"moderate", note:"Alcohol masks amphetamine stimulation – risk of alcohol poisoning without subjective warning signs" },
  { a:"adderall",    b:"koffein",         type:"mixed",    severity:"low",      note:"Additive stimulant effect – increased heart rate and blood pressure. Monitor for anxiety/jitteriness." },
  { a:"adderall",    b:"sertralin",       type:"risk",     severity:"moderate", note:"Amphetamines increase serotonin release – moderate serotonin syndrome risk, especially at higher doses" },
  { a:"adderall",    b:"escitalopram",    type:"risk",     severity:"moderate", note:"Same as sertralin – serotonergic risk with SSRI combination" },
  { a:"adderall",    b:"melatonin",       type:"antagonist",severity:"moderate",note:"Amphetamine delays melatonin onset significantly. Must allow ≥8h washout before sleep aids." },

  // ── Scene / Recreational Drug Interactions ────────────────
  // Critical
  { a:"mdma",        b:"sertralin",       type:"risk",       severity:"critical", note:"⚠️ KRITISCH: Serotonin-Syndrom! MDMA setzt massiv Serotonin frei, SSRI hemmt Wiederaufnahme – lebensbedrohliche Hyperthermie, Klonus, Agitation möglich. Absolute Kontraindikation." },
  { a:"mdma",        b:"escitalopram",    type:"risk",       severity:"critical", note:"⚠️ KRITISCH: Serotonin-Syndrom-Risiko identisch wie mit Sertralin. SSRI + MDMA = lebensgefährlich." },
  { a:"ghb",         b:"alkohol",         type:"risk",       severity:"critical", note:"⚠️ KRITISCH: GHB + Alkohol → additive GABA-Dämpfung → Atemstillstand. Eine der häufigsten Todesursachen bei Drogennotfällen!" },
  { a:"ghb",         b:"diphenhydramin",  type:"risk",       severity:"high",     note:"⚠️ GHB + Antihistaminikum: additive ZNS-Dämpfung, Bewusstlosigkeit, Atemdepression. Kombination vermeiden." },
  { a:"ghb",         b:"doxylamin",       type:"risk",       severity:"high",     note:"⚠️ GHB + Doxylamin: stark additive Sedierung und Atemdepression – lebensgefährlich." },
  { a:"ketamin",     b:"alkohol",         type:"risk",       severity:"high",     note:"⚠️ Ketamin + Alkohol: additive Dissoziation und Atemdepression. Erhöhtes K-Hole-Risiko. Kombination kontraindiziert." },

  // High severity
  { a:"mdma",        b:"speed",           type:"risk",       severity:"high",     note:"⚠️ Zwei Stimulanzien: kardiovaskuläre Überlastung, Hyperthermie, Serotonerge Toxizität. Kombination gefährlich." },
  { a:"mdma",        b:"kokain",          type:"risk",       severity:"high",     note:"⚠️ MDMA + Kokain: massive Herzbelastung (HF, Blutdruck), Hyperthermie-Risiko, serotonerg-dopaminerge Überstimulation." },
  { a:"kokain",      b:"alkohol",         type:"risk",       severity:"high",     note:"⚠️ Cocaethylen-Bildung in der Leber: 3× erhöhtes Herzinfarkt-Risiko, verlängerte Euphorie kaschiert Intoxikation." },

  // Moderate
  { a:"speed",       b:"alkohol",         type:"risk",       severity:"moderate", note:"Alkohol maskiert Amphetamin-Stimulation – erhöhte Alkoholvergiftungsgefahr ohne subjektive Warnsignale. Nierenstress." },
  { a:"cannabis",    b:"alkohol",         type:"risk",       severity:"moderate", note:"'Greening out': Alkohol erhöht THC-Resorption und Intensität stark. Übelkeit, Panikattacken, Ohnmacht möglich." },

  // Mixed / Cross-tolerance
  { a:"lsd",         b:"psilocybin",      type:"mixed",      severity:"moderate", note:"Kreuztoleranz: Beide 5-HT2A-Agonisten. Kombiniert oft verstärkte, schwer steuerbare Wirkung. Kein additiver Genuss – eher riskant." },

  // Antagonisms / Reduced effect
  { a:"cannabis",    b:"lsd",             type:"mixed",      severity:"moderate", note:"Cannabis kann LSD-Trip intensivieren oder destabilisieren – erhöhtes Angst-/Paranoia-Risiko. Unvorhersehbar." },
  { a:"cannabis",    b:"psilocybin",      type:"mixed",      severity:"moderate", note:"Cannabis + Psilocybin: intensivere und verlängerte Wirkung, schwerer steuerbar. Erhöhtes Bad-Trip-Risiko." },

];


// ─────────────────────────────────────────────────────────────
// HILFSFUNKTIONEN FÜR DIE APP
// ─────────────────────────────────────────────────────────────

/** Substanz by ID finden */
export function getSubstance(id) {
  return SUBSTANCES.find(s => s.id === id);
}

/** Alle Substanzen einer Kategorie */
export function getByCategory(categoryId) {
  return SUBSTANCES.filter(s => s.category === categoryId);
}

/** Wechselwirkungen für eine Substanz */
export function getInteractions(substanceId) {
  return INTERACTIONS.filter(
    ix => ix.a === substanceId || ix.b === substanceId
  ).map(ix => ({
    ...ix,
    partner: ix.a === substanceId ? ix.b : ix.a,
    partnerSubstance: getSubstance(ix.a === substanceId ? ix.b : ix.a),
  }));
}

/** Wechselwirkungen zwischen 2 Substanzen */
export function getInteractionBetween(idA, idB) {
  return INTERACTIONS.find(
    ix => (ix.a === idA && ix.b === idB) || (ix.a === idB && ix.b === idA)
  ) || null;
}

/**
 * Resolve interaction ID: substances with interactionGroup inherit interactions
 * from that group ID (e.g. bier_gross → alkohol, espresso → koffein).
 */
function resolveInteractionId(substanceId) {
  const sub = getSubstance(substanceId);
  return (sub && sub.interactionGroup) ? sub.interactionGroup : substanceId;
}

/** Wechselwirkungen für eine Liste aktiver Substanzen */
export function getActiveInteractions(substanceIds) {
  const result = [];
  // Deduplicate by resolved interaction ID to avoid duplicate warnings
  // (e.g. bier_klein + bier_gross both → alkohol, no self-interaction)
  const seen = new Set();
  for (let i = 0; i < substanceIds.length; i++) {
    for (let j = i + 1; j < substanceIds.length; j++) {
      const idA = resolveInteractionId(substanceIds[i]);
      const idB = resolveInteractionId(substanceIds[j]);
      if (idA === idB) continue; // same group (e.g. two drinks) — no self-interaction
      const key = [idA, idB].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      const ix = getInteractionBetween(idA, idB);
      if (ix) result.push(ix);
    }
  }
  return result;
}

/**
 * PK-Kurve generieren.
 *
 * Für chronische Substanzen (SSRIs, Atomoxetin) wird ein flaches Plateau
 * zurückgegeben, das den aufgebauten Steady-State-Spiegel symbolisiert –
 * nicht den akuten Peak-Effekt.
 */
export function generateCurve(substance, intakeHour = 8, numPoints = 49) {
  const { onsetHours, tmaxHours, durationHours, halflifeHours } = substance.pk;
  const { maxEffectScore } = substance;
  if (!tmaxHours || !durationHours) return [];

  // ── Chronische Substanzen: Steady-State-Plateau ──────────────
  // Kein akuter Wirkverlauf sichtbar – stattdessen flache Linie die zeigt,
  // dass die Substanz dauerhaft im System ist.
  if (substance.pk.curveType === "chronic") {
    const plateau = +(maxEffectScore * 0.35).toFixed(1); // ~35 % = typischer Steady-State
    return Array.from({ length: numPoints }, (_, i) => ({
      time: `${String(Math.floor(i/2)).padStart(2,"0")}:${i%2 ? "30" : "00"}`,
      value: plateau,
      isChronic: true,
    }));
  }

  // ── Alkohol: Zero-Order-Kinetik (linearer Abbau) ─────────────
  const isLinear = substance.pk.metabolismType === "linear";

  return Array.from({ length: numPoints }, (_, i) => {
    const h = i / 2;
    const t = h - intakeHour - (onsetHours || 0);
    const peakT  = tmaxHours    - (onsetHours || 0);
    const endT   = durationHours - (onsetHours || 0);
    let v = 0;

    if (t >= 0 && t <= endT) {
      if (t <= peakT) {
        // Glatter kubischer Anstieg (Smoothstep)
        v = maxEffectScore * Math.pow(t / peakT, 2) * (3 - 2 * (t / peakT));
      } else if (isLinear) {
        // Zero-Order-Kinetik: konstante Abbaurate (Alkohol, ~0.15 ‰/h)
        v = maxEffectScore * Math.max(0, 1 - (t - peakT) / (endT - peakT));
      } else {
        // Pharmakokinetischer Abfall mit echter Halbwertszeit
        const t12 = halflifeHours || (durationHours / 3);
        const ke  = Math.log(2) / t12;
        v = maxEffectScore * Math.exp(-ke * (t - peakT));

        // Sanfter Ausklang nahe dem Ende der Wirkdauer (letztes Drittel)
        const fadeStart = peakT + (endT - peakT) * 0.65;
        if (t > fadeStart) {
          v *= Math.max(0, (endT - t) / (endT - fadeStart));
        }
      }
    }

    return {
      time: `${String(Math.floor(h)).padStart(2,"0")}:${h%1 ? "30" : "00"}`,
      value: +Math.max(0, v).toFixed(1),
    };
  });
}

export default SUBSTANCES;
