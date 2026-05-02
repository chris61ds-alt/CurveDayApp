# Datenschutzerklärung / Privacy Policy

**CurveDay – Pharmakodynamik-Tracker**  
Stand / Last updated: 02. Mai 2026

---

## DEUTSCH

### 1. Verantwortlicher

Verantwortlicher im Sinne der DSGVO (Art. 4 Nr. 7 DSGVO):

**Christoph Lukas Eisner**  
E-Mail: chris61ds@gmail.com

Anfragen zum Datenschutz richten Sie bitte an diese E-Mail-Adresse.

---

### 2. Grundsatz: Lokale Datenspeicherung

CurveDay ist als **Privacy-by-Design**-Anwendung konzipiert.

- **Kein Konto erforderlich.** Die App kann vollständig ohne Registrierung genutzt werden.
- **Alle persönlichen Daten verbleiben standardmäßig auf Ihrem Gerät.** Es erfolgt keine automatische Übertragung an Server.
- **Keine Werbung, kein Tracking, keine Analyse.** Wir setzen keine Analytics-SDKs (z. B. Firebase Analytics, Mixpanel, Meta Pixel) ein.

---

### 3. Verarbeitete Daten

#### 3a. Lokal auf Ihrem Gerät gespeicherte Daten

Alle nachfolgend genannten Daten werden ausschließlich lokal in der verschlüsselten App-Sandbox Ihres Geräts gespeichert (AsyncStorage / iOS Data Protection / Android Keystore-Bereich) und **nicht an Dritte übermittelt**, sofern Sie die optionale Cloud-Synchronisation nicht aktivieren.

| Datenkategorie | Inhalt | Zweck |
|---|---|---|
| **Einnahmeprotokolle** | Substanz-ID, Dosierung, Einnahmezeitpunkt (ISO 8601) | Berechnung der Wirkungskurve |
| **Nutzerprofil** | Gewicht (kg), Größe (cm), Alter, Geschlecht *(alle freiwillig)* | Anpassung der pharmakodynamischen Modelle |
| **Schlafpräferenzen** | Schlafbeginn und -ende als Dezimalstunden | Berechnung schlafbezogener Warnbenachrichtigungen |
| **Einstellungen** | Erscheinungsmodus (Hell/Dunkel), Region, Benachrichtigungseinstellungen | Personalisierung der Benutzeroberfläche |
| **Onboarding-Status** | Datum der Haftungsausschluss-Bestätigung | Nachweis der Kenntnisnahme des Haftungsausschlusses |

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / Bereitstellung der App-Funktion) sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, soweit freiwillige Profilangaben betroffen sind).

#### 3b. Geräteberechtigungen

| Berechtigung | Plattform | Zweck | Pflicht? |
|---|---|---|---|
| **Benachrichtigungen** (POST_NOTIFICATIONS / UNUserNotificationCenter) | Android / iOS | Wirkpeak-Alerts, Warnungen bei Wechselwirkungen, Schlafhinweise | Nein – optional, jederzeit widerrufbar in den Systemeinstellungen |
| **Fotomediathek – Schreiben** (WRITE_EXTERNAL_STORAGE / NSPhotoLibraryAddUsageDescription) | Android / iOS | Speichern exportierter Instagram-Story-Grafiken | Nein – nur beim Export aktiviert |
| **Internet** | Android | Optionale Cloud-Synchronisation (nur wenn angemeldet) | Nein – nur wenn Cloud-Sync aktiviert |

Benachrichtigungsberechtigungen können jederzeit in den Systemeinstellungen Ihres Geräts unter *Einstellungen → Apps → CurveDay → Benachrichtigungen* (Android) bzw. *Einstellungen → CurveDay → Mitteilungen* (iOS) widerrufen werden.

#### 3c. Optionale Cloud-Synchronisation (nur bei Anmeldung)

CurveDay bietet eine **freiwillige** Möglichkeit, Einnahmeprotokolle geräteübergreifend zu synchronisieren. Diese Funktion ist **standardmäßig deaktiviert** und erfordert eine ausdrückliche Anmeldung.

Wenn Sie sich anmelden, werden folgende Daten an **Supabase Inc.** übertragen:

- E-Mail-Adresse (für die Authentifizierung via Google Sign-In oder E-Mail)
- Einnahmeprotokolle (Substanz-ID, Dosierung, Zeitstempel)

**Supabase Inc.**  
Anbieter der Datenbankinfrastruktur  
Datenschutzerklärung: https://supabase.com/privacy  
Datenverarbeitungsvertrag (DPA) mit EU-Standardvertragsklauseln: https://supabase.com/dpa

Supabase speichert Daten in der von uns gewählten Region. Die Datenverarbeitung außerhalb des EWR erfolgt auf Grundlage der EU-Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c DSGVO.

Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch ausdrückliche Anmeldung).

Sie können Ihren Cloud-Account jederzeit unter *Einstellungen → Konto → Abmelden* deaktivieren. Gespeicherte Cloud-Daten können durch eine E-Mail an chris61ds@gmail.com gelöscht werden.

---

### 4. Zwecke der Verarbeitung

Wir verarbeiten Ihre Daten ausschließlich für folgende Zwecke:

1. **Bereitstellung der App-Funktionen** — Berechnung und Darstellung pharmakodynamischer Wirkungskurven, Interaktionshinweise, Benachrichtigungen
2. **Verbesserung der Modellgenauigkeit** — Anpassung der PK-Parameter an optionale Profilangaben (lokal, keine Übertragung)
3. **Optionale Datensicherung** — Geräteübergreifende Synchronisation von Einnahmeprotokollen (nur mit Einwilligung)

Eine Verarbeitung zu Werbe-, Profiling- oder anderen Zwecken findet nicht statt.

---

### 5. Keine Weitergabe an Dritte (außer Cloud-Sync)

Wir verkaufen, vermieten oder handeln Ihre Daten **nicht**. Eine Weitergabe erfolgt ausschließlich:

- An **Supabase Inc.** als Auftragsverarbeiter (Art. 28 DSGVO), soweit Sie die Cloud-Synchronisation aktiviert haben
- An **Google LLC** für die Authentifizierung via Google Sign-In (nur bei Nutzung dieser Anmeldemethode); Datenschutzerklärung: https://policies.google.com/privacy
- Wenn wir gesetzlich dazu verpflichtet sind (z. B. durch Gerichtsbeschluss)

---

### 6. Speicherdauer

| Datenkategorie | Speicherdauer |
|---|---|
| Lokale Einnahmedaten | Bis zur manuellen Löschung durch den Nutzer oder Deinstallation der App |
| Cloud-Daten (Supabase) | Bis zur Löschung durch den Nutzer oder Anforderung per E-Mail |
| Google-Authentifizierungsdaten | Gemäß Google-Datenschutzerklärung |

---

### 7. Ihre Rechte (DSGVO Art. 15–22)

Als betroffene Person haben Sie folgende Rechte:

| Recht | Inhalt |
|---|---|
| **Auskunft** (Art. 15) | Sie können jederzeit Auskunft darüber verlangen, welche Daten wir über Sie verarbeiten |
| **Berichtigung** (Art. 16) | Sie können die Korrektur unrichtiger Daten verlangen |
| **Löschung** (Art. 17) | Sie können die Löschung Ihrer Daten verlangen ("Recht auf Vergessenwerden") |
| **Einschränkung** (Art. 18) | Sie können die eingeschränkte Verarbeitung Ihrer Daten verlangen |
| **Datenübertragbarkeit** (Art. 20) | Sie können Ihre Daten in einem maschinenlesbaren Format erhalten |
| **Widerspruch** (Art. 21) | Sie können der Verarbeitung widersprechen |
| **Widerruf der Einwilligung** | Sie können eine erteilte Einwilligung jederzeit widerrufen, ohne dass die Rechtmäßigkeit der bisherigen Verarbeitung berührt wird |

**So löschen Sie Ihre Daten in der App:**
- Lokale Daten: *Einstellungen → Daten → Alle Einnahmen löschen* — oder Deinstallation der App
- Cloud-Daten: E-Mail an chris61ds@gmail.com mit dem Betreff „Datenlöschung CurveDay"

**Beschwerderecht:** Wenn Sie der Auffassung sind, dass die Verarbeitung Ihrer Daten gegen die DSGVO verstößt, haben Sie das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Zuständige Aufsichtsbehörde in Deutschland: **Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)**, www.lda.bayern.de (oder die Behörde Ihres Bundeslandes).

---

### 8. Minderjährige

CurveDay richtet sich nicht an Personen unter 16 Jahren. Wir erheben wissentlich keine Daten von Kindern. Falls Sie erfahren, dass ein Kind unter 16 Jahren die App nutzt, bitten wir Sie, uns unter chris61ds@gmail.com zu kontaktieren.

---

### 9. Medizinischer Haftungsausschluss

CurveDay ist **kein Medizinprodukt** im Sinne der EU-Medizinprodukteverordnung (MDR 2017/745) oder des Medizinproduktegesetzes. Die App:

- ersetzt **keinen Arzt, Apotheker oder medizinischen Fachmann**
- stellt **keine medizinische Diagnose**
- gibt **keine Therapieempfehlung**
- basiert auf populationsdurchschnittlichen pharmakologischen Modellen, die individuelle Unterschiede nicht vollständig abbilden können

Alle Angaben dienen ausschließlich der allgemeinen Information. Bei gesundheitlichen Fragen oder Notfällen wenden Sie sich an einen Arzt oder rufen Sie den Notruf (112) an.

---

### 10. Datensicherheit

Die lokal gespeicherten Daten sind durch die Sicherheitsmechanismen des jeweiligen Betriebssystems geschützt (iOS Data Protection Class, Android Encrypted Shared Preferences). Wir empfehlen, Ihr Gerät mit einem aktuellen Betriebssystem und einer Bildschirmsperre zu betreiben.

Cloud-Daten werden verschlüsselt übertragen (TLS 1.2+) und bei Supabase mit AES-256 gespeichert.

---

### 11. Änderungen dieser Datenschutzerklärung

Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren. Wesentliche Änderungen werden durch einen Hinweis beim App-Start kommuniziert. Das Datum der letzten Änderung steht oben am Anfang dieses Dokuments. Die jeweils aktuelle Version ist unter der URL dieser Datenschutzerklärung abrufbar.

---

### 12. Kontakt & Impressum

**Verantwortlicher nach § 5 TMG und Art. 13/14 DSGVO:**

Christoph Lukas Eisner  
E-Mail: chris61ds@gmail.com

*(Vollständige Postanschrift auf Anfrage – gemäß § 5 Abs. 1 Nr. 1 TMG beim Betrieb einer App ohne eigene Website nicht zwingend öffentlich anzugeben, sofern die E-Mail-Adresse für behördliche und rechtliche Zwecke erreichbar ist.)*

---

---

## ENGLISH

### Summary in English

**Data Controller:** Christoph Lukas Eisner · chris61ds@gmail.com

#### What data does CurveDay process?

**By default, CurveDay processes all data exclusively on your device.** No account is required. No data is transmitted to any server.

Data stored locally on your device:
- Substance intake logs (substance ID, dose, timestamp)
- Optional user profile (weight, height, age, sex) — used only to adjust PK model parameters locally
- Sleep preferences — used for sleep disruption notifications
- App settings (theme, region, notification preferences)

#### Device Permissions

| Permission | Purpose | Required? |
|---|---|---|
| Notifications | Peak alerts, interaction warnings, sleep warnings | No – optional, revocable anytime |
| Photo Library (write) | Saving exported Story graphics | No – only on export |
| Internet | Optional cloud sync when signed in | No – only if cloud sync enabled |

#### Optional Cloud Sync

If you choose to create an account, intake logs and your email address are synced to **Supabase Inc.** (our data processor under GDPR Art. 28). This feature is opt-in and can be disabled at any time. See Supabase's privacy policy: https://supabase.com/privacy

#### No Ads. No Tracking. No Analytics.

CurveDay contains no advertising SDKs, no analytics tools, and no third-party tracking. Your health data is never sold or shared for commercial purposes.

#### Medical Disclaimer

CurveDay is **not a medical device**. It does not diagnose, treat, or replace professional medical advice. All pharmacokinetic models are based on population averages and may not reflect your individual response. Always consult a healthcare professional for medical decisions.

#### Your Rights (GDPR)

You have the right to access, correct, delete, and export your data. To exercise these rights or request deletion of cloud data, email: **chris61ds@gmail.com**

To delete local data: open the app → Settings → Delete all intakes — or uninstall the app.

To file a complaint: contact your local data protection authority (in the EU, find yours at https://edpb.europa.eu/about-edpb/board/members_en).

#### Contact

chris61ds@gmail.com

*Last updated: May 2, 2026*
