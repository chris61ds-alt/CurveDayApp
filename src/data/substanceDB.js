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
    brandNames: ["Kaffee", "Espresso", "Red Bull", "Monster", "Coffein-Tabletten", "NoDoz", "Vivarin"],
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
  { a:"nikotin_patch",b:"koffein",     type:"mixed",      severity:"low",      note:"Nikotin beschleunigt Koffeinabbau um ~50% – bei Rauchstopp plötzlich höhere Koffeinspiegel möglich" },

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

/** Wechselwirkungen für eine Liste aktiver Substanzen */
export function getActiveInteractions(substanceIds) {
  const result = [];
  for (let i = 0; i < substanceIds.length; i++) {
    for (let j = i + 1; j < substanceIds.length; j++) {
      const ix = getInteractionBetween(substanceIds[i], substanceIds[j]);
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
