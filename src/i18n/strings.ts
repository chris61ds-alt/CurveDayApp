/**
 * CurveDay i18n — String interface
 * Every key must exist in both de.ts and en.ts
 */
export interface Strings {
  // ── Common ───────────────────────────────────────────────────
  cancel:       string;
  save:         string;
  next:         string;
  back:         string;
  skip:         string;
  done:         string;
  delete:       string;
  edit:         string;
  close:        string;
  add:          string;
  loading:      string;
  notSpecified: string;
  yes:          string;
  no:           string;
  ok:           string;
  confirm:      string;
  warning:      string;
  error:        string;
  info:         string;
  timeUnit:     string;  // ' Uhr' (DE) | '' (EN) — appended after formatted time

  // ── Tabs ─────────────────────────────────────────────────────
  tabCurve:       string;
  tabIntakes:     string;
  tabSubstances:  string;
  tabSettings:    string;

  // ── Chart ────────────────────────────────────────────────────
  chartNow:         string;
  chartTomorrow:    string;
  chartSteadyState: string;
  chartSleep:       string;
  chartNoIntakes:   string;

  // ── Main Screen (index) ───────────────────────────────────────
  homeTitle:            string;
  homeDate:             (date: Date) => string;
  homeEmptyTitle:       string;
  homeEmptyDesc:        string;
  homeEmptyBtn:         string;
  homeEmptyHint1:       string;
  homeEmptyHint2:       string;
  homeEmptyHint3:       string;
  homeSectionState:     string;
  homeSectionDetail:    string;
  homeSectionIx:        string;
  homeActiveNow:        string;
  homeNoActive:         string;
  homeBedtimeWarn:      (time: string) => string;
  homeStateStrong:      string;
  homeStateModerate:    string;
  homeStateLight:       string;
  homePeak:             string;
  homeRemaining:        string;
  homeNextDose:         string;
  homeInteraction:      string;
  homeSynergy:          string;
  homeAntagonist:       string;
  homeRisk:             string;
  homeMixed:            string;
  homeFoodEffect:       string;
  homeMealTitle:        (time: string) => string;
  homeMealSmall:        string;
  homeMealMedium:       string;
  homeMealLarge:        string;
  homeMealCancel:       string;

  // ── Intake Card ───────────────────────────────────────────────
  intakePeakAt:       string;
  intakeRemaining:    string;
  intakeActive:       string;
  intakeInactive:     string;
  intakeExpired:      string;
  intakeDeleteTitle:  string;
  intakeDeleteMsg:    (name: string) => string;

  // ── Intakes Screen ────────────────────────────────────────────
  intakesTitle:         string;
  intakesActiveSection: string;
  intakesOtherSection:  string;
  intakesEmptyTitle:    string;
  intakesEmptyDesc:     string;
  intakesAddBtn:        string;
  intakesCount:         (n: number) => string;

  // ── Substances Screen ─────────────────────────────────────────
  substancesTitle:       string;
  substancesSearchPlaceholder: string;
  substancesAll:         string;

  // ── Settings Screen ───────────────────────────────────────────
  settingsTitle:                string;
  settingsSectionAppearance:    string;
  settingsDarkMode:             string;
  settingsLightMode:            string;
  settingsToggleTheme:          string;
  settingsSectionAccount:       string;
  settingsSyncNow:              string;
  settingsSyncSub:              string;
  settingsLogout:               string;
  settingsLogoutSub:            string;
  settingsLoginGoogle:          string;
  settingsConnecting:           string;
  settingsSyncHint:             string;
  settingsSyncing:              string;
  settingsSynced:               string;
  settingsSectionNotif:         string;
  settingsNotifReminders:       string;
  settingsNotifRemindersSub:    string;
  settingsNotifPeak:            string;
  settingsNotifPeakSub:         string;
  settingsNotifDigest:          string;
  settingsNotifDigestSub:       string;
  settingsNotifDeleteAll:       (n: number) => string;
  settingsSectionData:          string;
  settingsIntakesCount:         string;
  settingsResetDemo:            string;
  settingsResetDemoSub:         string;
  settingsSectionApp:           string;
  settingsVersion:              string;
  settingsSubstancesCount:      string;
  settingsInteractionsCount:    string;
  settingsFeedback:             string;
  settingsFeedbackSub:          string;
  settingsSectionRegion:        string;
  settingsRegionLabel:          string;
  settingsChangeRegion:         string;
  settingsChangeRegionSub:      string;
  settingsSectionSleep:         string;
  settingsBedtime:              string;
  settingsWakeUp:               string;
  settingsEditSleep:            string;
  settingsEditSleepSub:         string;
  settingsSectionProfile:       string;
  settingsWeight:               string;
  settingsHeight:               string;
  settingsAge:                  string;
  settingsAgeUnit:              string;
  settingsSex:                  string;
  settingsSexMale:              string;
  settingsSexFemale:            string;
  settingsSexOther:             string;
  settingsEditProfile:          string;
  settingsEditProfileSub:       string;
  settingsSectionTracking:      string;
  settingsTrackingGoals:        string;
  settingsRepeatOnboarding:     string;
  settingsRepeatOnboardingSub:  string;
  settingsDisclaimer:           string;
  settingsResetTitle:           string;
  settingsResetMsg:             (n: number) => string;
  settingsResetBtn:             string;
  settingsResetDone:            string;
  settingsResetDoneMsg:         string;
  settingsLogoutTitle:          string;
  settingsLogoutMsg:            string;
  settingsOnboardingResetTitle: string;
  settingsOnboardingResetMsg:   string;
  settingsNotifPermTitle:       string;
  settingsNotifPermMsg:         string;
  settingsNotifPermOpen:        string;
  settingsNotifDisableTitle:    string;
  settingsNotifDisableMsg:      string;
  settingsNotifDisableBtn:      string;
  settingsSyncDoneTitle:        string;
  settingsSyncDoneMsg:          string;
  settingsLoginDone:            string;
  settingsLoginDoneMsg:         string;
  settingsSupabaseNotConfigured: string;
  settingsSupabaseNotConfiguredSub: string;
  settingsProfileModalTitle:    string;
  settingsProfileHint:          string;
  settingsSleepModalTitle:      string;
  settingsSleepHint:            string;
  settingsSleepDuration:        (dur: string, start: string, end: string) => string;
  settingsRegionModalTitle:     string;
  settingsRegionHint:           string;

  // ── AddIntakeModal ────────────────────────────────────────────
  addTitle:            string;
  addSearchPlaceholder: string;
  addDose:             string;
  addTime:             string;
  addReminder:         string;
  addReminderSub:      string;
  addConfirm:          string;
  addBtmWarningTitle:  string;
  addBtmWarningText:   string;
  addRxWarningTitle:   string;
  addRxWarningText:    string;
  addCriticalTitle:    string;
  addCriticalConfirm:  string;
  addDoseInvalid:      string;
  addDoseTooHigh:      (max: number, unit: string) => string;
  addDoseHigher:       (max: number, unit: string) => string;
  addDoseLow:          (min: number, unit: string) => string;
  addDailyLimitTitle:  string;
  addDailyLimitText:   (max: number) => string;
  addFoodNote:         string;
  addPeakLabel:        string;   // 'Peak ca.' / 'Peak ~'
  addDurationLabel:    string;   // '· Wirkdauer' / '· Duration'
  addHoursUnit:        string;   // 'Std' / 'h'
  addWarningsTitle:    string;   // 'Hinweise' / 'Notes'

  // ── Onboarding ────────────────────────────────────────────────
  onboardingStart:          string;
  onboardingWelcomeTagline: string;
  onboardingWelcomeDesc:    string;
  onboardingRegionTitle:  string;
  onboardingRegionSub:    string;
  onboardingDisclTitle:   string;
  onboardingDisclSub:     string;
  onboardingDisclScroll:  string;
  onboardingDisclAccept:  string;
  onboardingDisclAcceptBtn: string;
  onboardingGoalsTitle:   string;
  onboardingGoalsSub:     string;
  onboardingGoalsBtn:     (n: number) => string;
  onboardingProfileTitle: string;
  onboardingProfileSub:   string;
  onboardingProfileSaveBtn: string;
  onboardingProfileSkipBtn: string;
  onboardingProfileHint:  string;
  onboardingReadyTitle:   string;
  onboardingReadySub:     string;
  onboardingReadyBtn:     string;
  onboardingReadyHint1:   string;
  onboardingReadyHint2:   string;
  onboardingReadyHint3:   string;
  onboardingReadyHint4:   string;
  onboardingWeight:       string;
  onboardingHeight:       string;
  onboardingAge:          string;
  onboardingSex:          string;
  onboardingSexMale:      string;
  onboardingSexFemale:    string;
  onboardingSexOther:     string;
  onboardingSexNote:      string;

  // ── Onboarding — Tracking Goals ───────────────────────────────
  goalMedicationLabel: string;
  goalMedicationDesc:  string;
  goalAdhdLabel:       string;
  goalAdhdDesc:        string;
  goalSleepLabel:      string;
  goalSleepDesc:       string;
  goalStimulantLabel:  string;
  goalStimulantDesc:   string;
  goalSupplementLabel: string;
  goalSupplementDesc:  string;
  goalRecLabel:        string;
  goalRecDesc:         string;
}
