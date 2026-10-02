/**
 * WakeUp Challenge - High-Tech Cognitive Anti-Snooze Mobile App
 * Core Application Engine, Audio Synthesizer, 5 Games, Telemetry & Alarm Management
 */

// =============================================================================
// 1. STATE & PERSISTENT STORAGE
// =============================================================================

const STORAGE_KEY = 'wakeup_challenge_app_state_v2';

const defaultAppState = {
  user: {
    name: 'Alex',
    streak: 7,
    bestStreak: 21,
    bestStreakDates: 'Oct 12 - Nov 02',
    campusRank: 'Top 5% campus rank',
    dormRank: 'Dorm Hall B Rank #14',
    xp: 480,
    xpMax: 600,
    level: 5,
    levelTitle: 'Brain Awakener',
    totalAlarms: 38,
    successfulWakeups: 34,
    snoozes: 4,
    snoozesPrevented: 26,
    missionsDone: 24,
    avgAwakening: 4.6,
    avgSpeedSeconds: 14.2,
    circadianIndex: 96.4,
    adaptiveLevel: 3,
    adaptiveDesc: 'Auto-scales complexity based on 1.4s response velocity'
  },
  alarms: [
    {
      id: 'alarm-hero',
      hour: 7,
      minute: 0,
      ampm: 'AM',
      name: 'School — Physics 101',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      sound: 'cyber-echo',
      antiSnooze: true,
      gameType: 'maze',
      difficulty: 'medium',
      enabled: true
    },
    {
      id: 'alarm-study',
      hour: 8,
      minute: 30,
      ampm: 'AM',
      name: 'Study Session',
      days: ['Sat', 'Sun'],
      sound: 'cyber-pulse',
      antiSnooze: true,
      gameType: 'maze',
      difficulty: 'medium',
      enabled: true
    },
    {
      id: 'alarm-chill',
      hour: 9,
      minute: 15,
      ampm: 'AM',
      name: 'Weekend Chill',
      days: ['Sat'],
      sound: 'energetic-chime',
      antiSnooze: false,
      gameType: 'pattern',
      difficulty: 'easy',
      enabled: false
    }
  ],
  gameRatings: {
    maze: { name: 'Maze Escape', emoji: '🌀', count: 62, totalStars: 298, avg: 4.8, desc: 'Labyrinth spark navigation', avgTime: '12.8s' },
    sequence: { name: 'Sequence Memory', emoji: '🧩', count: 48, totalStars: 221, avg: 4.6, desc: 'Light step memory recall', avgTime: '14.2s' },
    cards: { name: 'Card Match', emoji: '🃏', count: 35, totalStars: 150, avg: 4.3, desc: '4x4 neural pair discovery', avgTime: '18.5s' },
    pattern: { name: 'Pattern Recall', emoji: '⚡', count: 52, totalStars: 244, avg: 4.7, desc: 'Spatial matrix pattern', avgTime: '11.2s' },
    color: { name: 'Color Memory', emoji: '🎵', count: 40, totalStars: 180, avg: 4.5, desc: 'Harmonic Simon-style sequence', avgTime: '15.1s' }
  },
  personalBests: {
    maze: 8.9,
    sequence: 9.8,
    cards: 11.4,
    pattern: 7.9,
    color: 10.2
  },
  achievements: [
    { id: 'ach-1', icon: '🔥', title: '7-Day Streak', desc: 'Maintained uninterrupted 7-day wake cycle', unlocked: true, progress: '7/7' },
    { id: 'ach-2', icon: '🌀', title: 'Maze Master', desc: 'Cleared 20 Maze Escapes under 15s', unlocked: true, progress: '20/20' },
    { id: 'ach-3', icon: '🧠', title: 'Synapse Master', desc: 'Solved 25+ brain puzzles flawlessly', unlocked: true, progress: '25/25' },
    { id: 'ach-4', icon: '⏰', title: 'Early Bird', desc: 'Woke up before 07:00 AM 5 times', unlocked: true, progress: '5/5' },
    { id: 'ach-5', icon: '🛡️', title: 'Iron Anti-Snoozer', desc: '20 alarms cleared without snoozing', unlocked: true, progress: '20/20' },
    { id: 'ach-6', icon: '⚡', title: 'Speed Demon', desc: 'Cleared any challenge under 10 seconds', unlocked: true, progress: '8.9s PB' },
    { id: 'ach-7', icon: '🎓', title: 'Physics 101 Dawn', desc: '10 consecutive school morning alarms', unlocked: false, progress: '8/10' },
    { id: 'ach-8', icon: '👑', title: 'Mind Over Mattress', desc: 'Reach Level 10 Grand Riser', unlocked: false, progress: 'Lvl 5/10' }
  ]
};

let appState = loadAppState();

function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Object.assign({}, defaultAppState, parsed);
    }
  } catch (err) {
    console.warn('Storage read fallback to default:', err);
  }
  return JSON.parse(JSON.stringify(defaultAppState));
}

function saveAppState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (err) {
    console.error('Storage save error:', err);
  }
}

// =============================================================================
// 2. WEB AUDIO API SYNTHESIZER (Cyberpunk Alarm Tones & Muffled Siren)
// =============================================================================

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.alarmLoop = null;
    this.isPlaying = false;
    this.isMuffled = false;
    this.isMuted = false;
    this.lowpassFilter = null;
    this.masterGain = null;
    this.escalationTimeout = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.lowpassFilter = this.ctx.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.setValueAtTime(12000, this.ctx.currentTime); // open by default

      this.masterGain.connect(this.lowpassFilter);
      this.lowpassFilter.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuffled(muffled) {
    this.isMuffled = muffled;
    if (!this.ctx || !this.lowpassFilter) return;
    if (muffled) {
      // 65% muffled siren effect: filter down to 750Hz and reduce volume
      this.lowpassFilter.frequency.setTargetAtTime(750, this.ctx.currentTime, 0.1);
      this.masterGain.gain.setTargetAtTime(0.12, this.ctx.currentTime, 0.1);
    } else {
      this.lowpassFilter.frequency.setTargetAtTime(12000, this.ctx.currentTime, 0.1);
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime, 0.1);
    }
  }

  playTone(freq, type = 'sine', duration = 0.2, gainFactor = 0.25) {
    if (this.isMuted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    g.gain.setValueAtTime(gainFactor, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(g);
    g.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  startAlarmRingtone(sound = 'cyber-echo', forceEscalation = true) {
    this.init();
    this.stopAlarmRingtone();
    this.isPlaying = true;
    this.setMuffled(false);

    let step = 0;
    const tick = () => {
      if (!this.isPlaying) return;

      switch (sound) {
        case 'digital-siren':
          this.playTone(850, 'sawtooth', 0.14, 0.35);
          setTimeout(() => { if (this.isPlaying) this.playTone(1100, 'sawtooth', 0.14, 0.35); }, 150);
          break;

        case 'sunrise-melody':
          const notes = [523.25, 659.25, 783.99, 880, 1046.50]; // C5, E5, G5, A5, C6
          this.playTone(notes[step % notes.length], 'sine', 0.28, 0.3);
          step++;
          break;

        case 'energetic-chime':
          const chimeNotes = [659.25, 783.99, 987.77, 1318.51];
          this.playTone(chimeNotes[step % chimeNotes.length], 'triangle', 0.22, 0.32);
          step++;
          break;

        case 'cyber-echo':
        default:
          this.playTone(440, 'sawtooth', 0.18, 0.3);
          setTimeout(() => { if (this.isPlaying) this.playTone(660, 'square', 0.15, 0.25); }, 160);
          setTimeout(() => { if (this.isPlaying) this.playTone(880, 'sawtooth', 0.22, 0.35); }, 320);
          break;
      }
    };

    tick();
    this.alarmLoop = setInterval(tick, sound === 'sunrise-melody' ? 450 : 600);

    // Force Max Escalation: 15 seconds ramp to 95dB synth tone
    if (forceEscalation) {
      this.escalationTimeout = setTimeout(() => {
        if (this.isPlaying && !this.isMuffled) {
          this.masterGain.gain.setTargetAtTime(0.55, this.ctx.currentTime, 0.5);
        }
      }, 15000);
    }
  }

  stopAlarmRingtone() {
    this.isPlaying = false;
    if (this.alarmLoop) {
      clearInterval(this.alarmLoop);
      this.alarmLoop = null;
    }
    if (this.escalationTimeout) {
      clearTimeout(this.escalationTimeout);
      this.escalationTimeout = null;
    }
  }

  // SFX Chimes
  playSfxClick() {
    this.playTone(520, 'sine', 0.05, 0.15);
  }

  playSfxMove() {
    this.playTone(440, 'triangle', 0.06, 0.2);
  }

  playSfxKey() {
    this.playTone(784, 'sine', 0.12, 0.3);
    setTimeout(() => this.playTone(1046.5, 'sine', 0.18, 0.35), 80);
  }

  playSfxPad(padIndex) {
    const freqs = [349.23, 440.00, 523.25, 659.25, 783.99];
    this.playTone(freqs[padIndex % freqs.length], 'sine', 0.2, 0.35);
  }

  playSfxMatch() {
    this.playTone(587.33, 'sine', 0.12, 0.28);
    setTimeout(() => this.playTone(880.00, 'sine', 0.2, 0.32), 90);
  }

  playSfxError() {
    this.playTone(180, 'sawtooth', 0.22, 0.35);
  }

  playVictoryFanfare() {
    const victoryNotes = [440, 554.37, 659.25, 880, 1108.73];
    victoryNotes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.24, 0.35), i * 110);
    });
  }
}

const audio = new AudioSynthesizer();

// =============================================================================
// 3. APPLICATION CONTROLLER & NAVIGATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initDemoHeader();
  initBottomNavigation();
  initLiveClockLoop();
  initDashboard();
  initSetAlarmModal();
  initAlarmRingingScreen();
  initChallengeEngines();
  initResultScreen();
  initGamesLibraryView();
  initBadgesView();
});

// Demo Header Actions (Frame toggle, Theme toggle, Sound mute, Instant 3s test)
function initDemoHeader() {
  const btnFrame = document.getElementById('btn-frame-toggle');
  const deviceFrame = document.getElementById('device-frame');
  const btnTheme = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const btnMute = document.getElementById('btn-sound-mute-toggle');
  const muteIcon = document.getElementById('sound-mute-icon');
  const btnQuickAlarm = document.getElementById('btn-quick-alarm');

  btnFrame.addEventListener('click', () => {
    deviceFrame.classList.toggle('frameless');
    const isFrameless = deviceFrame.classList.contains('frameless');
    btnFrame.title = isFrameless ? 'Show Mobile Frame' : 'Hide Frame (Expand View)';
  });

  btnTheme.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light', !isDark);
    themeIcon.textContent = isDark ? '🌙' : '☀️';
  });

  btnMute.addEventListener('click', () => {
    audio.isMuted = !audio.isMuted;
    muteIcon.textContent = audio.isMuted ? '🔇' : '🔊';
  });

  btnQuickAlarm.addEventListener('click', () => {
    triggerAlarmCountdown(3);
  });
}

// Bottom Navigation (4 Tabs: Alarms, Games, Stats, Badges)
function initBottomNavigation() {
  const navTabs = document.querySelectorAll('.app-bottom-nav .nav-tab');
  const views = document.querySelectorAll('.app-view');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetViewId = tab.getAttribute('data-target');

      navTabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetView = document.getElementById(targetViewId);
      if (targetView) targetView.classList.add('active');

      // Scroll view back to top
      document.getElementById('app-screen-container').scrollTop = 0;
    });
  });

  // Filter pills on Stats page (7 Days, 30 Days, All-Time)
  const filterPills = document.querySelectorAll('.pill-filter-btn');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderStatsDataForRange(pill.getAttribute('data-range'));
    });
  });
}

// Live Clock & Alarm Synchronization Loop
function initLiveClockLoop() {
  const statusBarTime = document.getElementById('status-bar-time');
  const dashLiveTime = document.getElementById('dash-live-time');
  const welcomeDate = document.getElementById('welcome-sub-date');

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    const timeFormatted = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const statusFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    if (statusBarTime) statusBarTime.textContent = statusFormatted;
    if (dashLiveTime) dashLiveTime.innerHTML = `${timeFormatted}<small>${ampm}</small>`;

    // Format greeting date
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    if (welcomeDate) welcomeDate.textContent = `${dateStr} • Ready to conquer exams?`;

    // Recalculate hero countdown
    updateHeroCountdown();

    // Check alarm triggers on second 0
    if (seconds === 0) {
      checkScheduledAlarms(displayHours, minutes, ampm, now);
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

function checkScheduledAlarms(hours, minutes, ampm, now) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = daysOfWeek[now.getDay()];

  const triggeredAlarm = appState.alarms.find(a => {
    return a.enabled &&
           a.hour === hours &&
           a.minute === minutes &&
           a.ampm === ampm &&
           (a.days.includes(currentDay) || a.days.length === 0);
  });

  if (triggeredAlarm) {
    triggerAlarmActive(triggeredAlarm);
  }
}

// =============================================================================
// 4. TAB 1: DASHBOARD ENGINE
// =============================================================================

function initDashboard() {
  renderDashboard();

  // Hero trigger now
  document.getElementById('btn-trigger-hero-now').addEventListener('click', () => {
    const heroAlarm = appState.alarms[0];
    triggerAlarmActive(heroAlarm);
  });

  // Hero toggle
  const heroToggle = document.getElementById('hero-alarm-toggle');
  heroToggle.addEventListener('change', () => {
    if (appState.alarms[0]) {
      appState.alarms[0].enabled = heroToggle.checked;
      saveAppState();
      renderDashboard();
    }
  });

  // Open create alarm modal
  document.getElementById('btn-open-create-alarm').addEventListener('click', () => {
    openSetAlarmModal();
  });

  // View all alarms button redirects to create or opens alarms view
  document.getElementById('btn-view-all-alarms').addEventListener('click', () => {
    openSetAlarmModal();
  });
}

function renderDashboard() {
  const heroAlarm = appState.alarms[0] || {
    hour: 7, minute: 0, ampm: 'AM', name: 'School — Physics 101',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], sound: 'cyber-echo',
    antiSnooze: true, gameType: 'maze', difficulty: 'medium', enabled: true
  };

  // Render Hero
  document.getElementById('hero-alarm-digits').textContent =
    `${String(heroAlarm.hour).padStart(2, '0')}:${String(heroAlarm.minute).padStart(2, '0')}`;
  document.getElementById('hero-alarm-ampm').textContent = heroAlarm.ampm;
  document.getElementById('hero-alarm-label').textContent = heroAlarm.name;
  document.getElementById('hero-alarm-toggle').checked = heroAlarm.enabled;

  const gameNames = {
    maze: 'Maze Escape',
    sequence: 'Sequence Memory',
    cards: 'Card Match',
    pattern: 'Pattern Recall',
    color: 'Color Memory',
    random: 'Random Game'
  };
  document.getElementById('hero-mission-name').textContent = gameNames[heroAlarm.gameType] || 'Maze Escape';
  document.getElementById('hero-difficulty-tag').textContent =
    heroAlarm.difficulty === 'hard' ? 'Ext' : heroAlarm.difficulty === 'easy' ? 'Easy' : 'Med';

  // Hero Sound
  const soundLabels = {
    'cyber-echo': 'Cyber Echo',
    'sunrise-melody': 'Sunrise Melody',
    'digital-siren': 'Digital Siren',
    'energetic-chime': 'Energetic Chime'
  };
  document.getElementById('hero-sound-name').textContent = soundLabels[heroAlarm.sound] || 'Cyber Echo';

  // Hero Days
  const daysRow = document.getElementById('hero-days-row');
  const dayAbbrs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  daysRow.querySelectorAll('.day-cap').forEach((cap, idx) => {
    const d = dayAbbrs[idx];
    cap.classList.toggle('active', heroAlarm.days.includes(d));
  });

  // Anti-Snooze badge
  const antiSnoozeBadge = document.getElementById('hero-antisnooze-badge');
  if (heroAlarm.antiSnooze) {
    antiSnoozeBadge.innerHTML = '<span class="lock-icon">🔒</span><span>ANTI-SNOOZE ACTIVE</span>';
    antiSnoozeBadge.style.opacity = '1';
  } else {
    antiSnoozeBadge.innerHTML = '<span class="lock-icon">🔓</span><span>STANDARD SNOOZE</span>';
    antiSnoozeBadge.style.opacity = '0.6';
  }

  // Header streak
  document.getElementById('header-streak-days').textContent = `${appState.user.streak}d`;

  // Metrics
  document.getElementById('dash-streak-metric').textContent = appState.user.streak;
  document.getElementById('dash-solved-metric').textContent = appState.user.missionsDone;
  document.getElementById('dash-speed-metric').textContent = appState.user.avgAwakening;

  // Upcoming Alarms List
  renderUpcomingAlarmsList();
  updateHeroCountdown();
}

function updateHeroCountdown() {
  const heroAlarm = appState.alarms[0];
  if (!heroAlarm || !heroAlarm.enabled) {
    document.getElementById('hero-time-diff-text').textContent = 'paused';
    return;
  }

  const now = new Date();
  let target = new Date();
  let h = heroAlarm.hour % 12;
  if (heroAlarm.ampm === 'PM') h += 12;

  target.setHours(h, heroAlarm.minute, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target - now;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let text = '';
  if (diffHrs > 0) text = `in ${diffHrs}h ${diffMins}m`;
  else text = `in ${diffMins}m`;

  document.getElementById('hero-time-diff-text').textContent = text;
}

function renderUpcomingAlarmsList() {
  const container = document.getElementById('alarms-compact-list');
  container.innerHTML = '';

  const list = appState.alarms.slice(1);
  list.forEach(alarm => {
    const card = document.createElement('div');
    card.className = 'alarm-compact-card';

    const gameNames = {
      maze: '🌀 Maze Escape',
      sequence: '🧩 Sequence Memory',
      cards: '🃏 Card Match',
      pattern: '⚡ Pattern Recall',
      color: '🎵 Color Memory',
      random: '🎲 Random Game'
    };

    card.innerHTML = `
      <div class="alarm-compact-left">
        <div class="alarm-compact-icon">⏰</div>
        <div class="alarm-compact-info">
          <div class="alarm-compact-time-row">
            <span class="alarm-compact-time">${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}</span>
            <span class="alarm-compact-ampm">${alarm.ampm}</span>
          </div>
          <span class="alarm-compact-sub">${alarm.name} • ${gameNames[alarm.gameType] || 'Brain Game'}</span>
        </div>
      </div>
      <div class="alarm-compact-right">
        ${alarm.antiSnooze ? '<span class="lock-mini-icon">🔒</span>' : ''}
        <label class="toggle-switch-ios">
          <input type="checkbox" class="toggle-sub-alarm" ${alarm.enabled ? 'checked' : ''}>
          <span class="slider-ios"></span>
        </label>
      </div>
    `;

    const toggle = card.querySelector('.toggle-sub-alarm');
    toggle.addEventListener('change', () => {
      alarm.enabled = toggle.checked;
      saveAppState();
    });

    container.appendChild(card);
  });
}

// =============================================================================
// 5. SET ALARM MODAL (Screenshot 2 Reference)
// =============================================================================

let modalSelectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
let modalSelectedPeriod = 'AM';
let modalSelectedDifficulty = 'medium';

function initSetAlarmModal() {
  const modal = document.getElementById('modal-create-alarm');
  const btnClose = document.getElementById('btn-close-alarm-modal');
  const btnSaveTop = document.getElementById('btn-sheet-save-top');
  const form = document.getElementById('form-alarm-setup');

  const hourInput = document.getElementById('input-alarm-hour');
  const minInput = document.getElementById('input-alarm-minute');
  const amBtn = document.getElementById('btn-period-am');
  const pmBtn = document.getElementById('btn-period-pm');

  const ghostHourUp = document.getElementById('ghost-hour-up');
  const ghostMinUp = document.getElementById('ghost-min-up');
  const ghostHourDown = document.getElementById('ghost-hour-down');
  const ghostMinDown = document.getElementById('ghost-min-down');

  function updateGhostNumbers() {
    let h = parseInt(hourInput.value, 10) || 7;
    let m = parseInt(minInput.value, 10) || 0;

    let hUp = h === 1 ? 12 : h - 1;
    let hDown = h === 12 ? 1 : h + 1;
    let mUp = m === 0 ? 59 : m - 1;
    let mDown = m === 59 ? 0 : m + 1;

    ghostHourUp.textContent = String(hUp).padStart(2, '0');
    ghostMinUp.textContent = String(mUp).padStart(2, '0');
    ghostHourDown.textContent = String(hDown).padStart(2, '0');
    ghostMinDown.textContent = String(mDown).padStart(2, '0');

    updateModalCountdownPill();
  }

  hourInput.addEventListener('input', updateGhostNumbers);
  minInput.addEventListener('input', updateGhostNumbers);

  // AM/PM Buttons
  amBtn.addEventListener('click', () => {
    modalSelectedPeriod = 'AM';
    amBtn.classList.add('active');
    pmBtn.classList.remove('active');
    updateModalCountdownPill();
  });

  pmBtn.addEventListener('click', () => {
    modalSelectedPeriod = 'PM';
    pmBtn.classList.add('active');
    amBtn.classList.remove('active');
    updateModalCountdownPill();
  });

  // Quick adjust pills: -15m, +15m, +30m
  document.querySelectorAll('.btn-adjust-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = parseInt(btn.getAttribute('data-adjust'), 10);
      let h = parseInt(hourInput.value, 10) || 7;
      let m = parseInt(minInput.value, 10) || 0;

      let totalMins = (h % 12) * 60 + m + delta;
      if (modalSelectedPeriod === 'PM') totalMins += 12 * 60;
      if (totalMins < 0) totalMins += 24 * 60;
      totalMins = totalMins % (24 * 60);

      let newH = Math.floor(totalMins / 60);
      let newM = totalMins % 60;
      modalSelectedPeriod = newH >= 12 ? 'PM' : 'AM';
      newH = newH % 12 || 12;

      hourInput.value = newH;
      minInput.value = String(newM).padStart(2, '0');

      amBtn.classList.toggle('active', modalSelectedPeriod === 'AM');
      pmBtn.classList.toggle('active', modalSelectedPeriod === 'PM');
      updateGhostNumbers();
    });
  });

  // Days Buttons
  const dayButtons = document.querySelectorAll('#sheet-days-selector .day-btn');
  dayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      modalSelectedDays = Array.from(dayButtons)
        .filter(b => b.classList.contains('active'))
        .map(b => b.getAttribute('data-day'));
      updateRepetitionSummaryBadge();
    });
  });

  // Game Selector Dropdown & Descriptions
  const selectMission = document.getElementById('select-alarm-mission');
  const gameIcon = document.getElementById('modal-game-icon');
  const gameDesc = document.getElementById('modal-game-desc');

  const gameMeta = {
    maze: { icon: '🌀', desc: 'Tilt or swipe spark through portals' },
    sequence: { icon: '🧩', desc: 'Memorize & reproduce light steps' },
    cards: { icon: '🃏', desc: '4x4 card grid - match neural pairs' },
    pattern: { icon: '⚡', desc: 'Spatial matrix memory recall' },
    color: { icon: '🎵', desc: 'Simon-style harmonic sequence' },
    random: { icon: '🎲', desc: 'Auto-rotates to prevent drowsiness habituation' }
  };

  selectMission.addEventListener('change', () => {
    const val = selectMission.value;
    if (gameMeta[val]) {
      gameIcon.textContent = gameMeta[val].icon;
      gameDesc.textContent = gameMeta[val].desc;
    }
  });

  // Difficulty segmented controls
  document.querySelectorAll('.btn-segment-diff').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-segment-diff').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      modalSelectedDifficulty = btn.getAttribute('data-diff');
      document.getElementById('modal-diff-adaptive-tag').textContent =
        modalSelectedDifficulty === 'hard' ? 'Level 05 extreme' : modalSelectedDifficulty === 'easy' ? 'Level 01 relaxed' : 'Level 03 adaptive';
    });
  });

  // Sound Preview Button
  let isSoundPreviewing = false;
  const btnSoundPreview = document.getElementById('btn-sheet-sound-preview');
  const previewIco = document.getElementById('preview-ico-state');
  const selectAudio = document.getElementById('select-alarm-audio-sound');

  btnSoundPreview.addEventListener('click', () => {
    if (isSoundPreviewing) {
      audio.stopAlarmRingtone();
      previewIco.textContent = '▶️';
      isSoundPreviewing = false;
    } else {
      audio.startAlarmRingtone(selectAudio.value, false);
      previewIco.textContent = '⏹️';
      isSoundPreviewing = true;
    }
  });

  // Close & Cancel
  btnClose.addEventListener('click', () => {
    closeSetAlarmModal();
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveConfiguredAlarm();
  });

  btnSaveTop.addEventListener('click', () => {
    saveConfiguredAlarm();
  });
}

function openSetAlarmModal() {
  const modal = document.getElementById('modal-create-alarm');
  modal.classList.add('active');
  updateRepetitionSummaryBadge();
  updateModalCountdownPill();
}

function closeSetAlarmModal() {
  const modal = document.getElementById('modal-create-alarm');
  modal.classList.remove('active');
  audio.stopAlarmRingtone();
  const previewIco = document.getElementById('preview-ico-state');
  if (previewIco) previewIco.textContent = '▶️';
}

function updateRepetitionSummaryBadge() {
  const badge = document.getElementById('repetition-summary-badge');
  const isWeekdays = modalSelectedDays.length === 5 &&
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].every(d => modalSelectedDays.includes(d));
  const isWeekends = modalSelectedDays.length === 2 &&
    ['Sat', 'Sun'].every(d => modalSelectedDays.includes(d));
  const isEveryday = modalSelectedDays.length === 7;

  if (isWeekdays) badge.textContent = 'Weekdays (Mon-Fri)';
  else if (isWeekends) badge.textContent = 'Weekends';
  else if (isEveryday) badge.textContent = 'Every day';
  else if (modalSelectedDays.length === 0) badge.textContent = 'Never (Once)';
  else badge.textContent = `${modalSelectedDays.length} Days`;
}

function updateModalCountdownPill() {
  const hourInput = document.getElementById('input-alarm-hour');
  const minInput = document.getElementById('input-alarm-minute');
  const pillText = document.getElementById('sheet-rings-countdown-text');

  let h = parseInt(hourInput.value, 10) || 7;
  let m = parseInt(minInput.value, 10) || 0;

  const now = new Date();
  let target = new Date();
  let targetH = h % 12;
  if (modalSelectedPeriod === 'PM') targetH += 12;

  target.setHours(targetH, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const diffMs = target - now;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  pillText.textContent = `Alarm rings in ${diffHrs}h ${diffMins}m`;
}

function saveConfiguredAlarm() {
  const hour = parseInt(document.getElementById('input-alarm-hour').value, 10) || 7;
  const minute = parseInt(document.getElementById('input-alarm-minute').value, 10) || 0;
  const name = document.getElementById('input-alarm-label').value.trim() || 'Morning Wake-up';
  const gameType = document.getElementById('select-alarm-mission').value;
  const sound = document.getElementById('select-alarm-audio-sound').value;
  const hardcoreLock = document.getElementById('toggle-hardcore-lock').checked;

  const newAlarm = {
    id: 'alarm-' + Date.now(),
    hour,
    minute,
    ampm: modalSelectedPeriod,
    name,
    days: modalSelectedDays.length > 0 ? modalSelectedDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    sound,
    antiSnooze: hardcoreLock,
    gameType,
    difficulty: modalSelectedDifficulty,
    enabled: true
  };

  // Put new alarm at the top of alarms list
  appState.alarms.unshift(newAlarm);
  saveAppState();
  renderDashboard();
  closeSetAlarmModal();
}

// =============================================================================
// 6. SCREEN 3: ALARM TRIGGERED & RINGING (Screenshot 5 Reference)
// =============================================================================

let activeAlarmSession = null;
let alarmStartTime = 0;
let emergencyHoldTimer = null;

function triggerAlarmCountdown(seconds = 3) {
  const btn = document.getElementById('btn-quick-alarm');
  let left = seconds;
  btn.textContent = `⏰ Ringing in ${left}s...`;

  const timer = setInterval(() => {
    left--;
    if (left > 0) {
      btn.textContent = `⏰ Ringing in ${left}s...`;
    } else {
      clearInterval(timer);
      btn.innerHTML = '<span class="pulse-dot"></span> Test Alarm in 3s';
      const sample = appState.alarms.find(a => a.enabled) || appState.alarms[0];
      triggerAlarmActive(sample);
    }
  }, 1000);
}

function triggerAlarmActive(alarm) {
  activeAlarmSession = alarm || appState.alarms[0];
  alarmStartTime = Date.now();

  const ringingScreen = document.getElementById('screen-alarm-ringing');
  document.getElementById('ringing-digits').textContent =
    `${activeAlarmSession.hour}:${String(activeAlarmSession.minute).padStart(2, '0')}`;
  document.getElementById('ringing-ampm').textContent = activeAlarmSession.ampm;

  // Challenge Preview
  const gameNames = {
    maze: 'Maze Escape',
    sequence: 'Sequence Memory',
    cards: 'Card Match',
    pattern: 'Pattern Recall',
    color: 'Color Memory',
    random: 'Random Game'
  };

  const gameDescs = {
    maze: 'Guide the neural spark through the labyrinth to the awakening portal to disarm siren.',
    sequence: 'Memorize and reproduce the light pattern sequence correctly to disarm the audio siren completely.',
    cards: 'Uncover and match all neural memory card pairs to disarm the audio siren.',
    pattern: 'Memorize the active spatial matrix nodes and reproduce them to stop the alarm.',
    color: 'Reproduce the exact harmonic color chime pattern to silence the siren.',
    random: 'Engage random cognitive challenge to disarm siren and reactivate brain synapses.'
  };

  const selectedType = activeAlarmSession.gameType === 'random'
    ? pickRandomGameType()
    : activeAlarmSession.gameType;

  activeAlarmSession.resolvedGameType = selectedType;

  document.getElementById('ringing-game-name').textContent = gameNames[selectedType] || 'Maze Escape';
  document.getElementById('ringing-challenge-desc').textContent = gameDescs[selectedType] || gameDescs.maze;

  // Anti-Snooze lock controls
  const standardRow = document.getElementById('standard-dismiss-row');
  if (activeAlarmSession.antiSnooze) {
    standardRow.style.display = 'none';
  } else {
    standardRow.style.display = 'flex';
  }

  // Play audio ringtone
  audio.startAlarmRingtone(activeAlarmSession.sound, true);

  // Show fullscreen ringing interface
  ringingScreen.classList.add('active');
}

function pickRandomGameType() {
  const games = ['maze', 'sequence', 'cards', 'pattern', 'color'];
  return games[Math.floor(Math.random() * games.length)];
}

function initAlarmRingingScreen() {
  const btnStartChallenge = document.getElementById('btn-start-alarm-challenge');
  const btnSnoozePlain = document.getElementById('btn-snooze-plain');
  const btnDismissPlain = document.getElementById('btn-dismiss-plain');
  const ringingScreen = document.getElementById('screen-alarm-ringing');

  btnStartChallenge.addEventListener('click', () => {
    // Transition straight into active puzzle!
    ringingScreen.classList.remove('active');
    launchActiveGameChallenge(activeAlarmSession);
  });

  btnSnoozePlain.addEventListener('click', () => {
    audio.stopAlarmRingtone();
    ringingScreen.classList.remove('active');
    appState.user.snoozes += 1;
    saveAppState();
    showToastAlert('💤 Snoozed for 5 minutes.');
  });

  btnDismissPlain.addEventListener('click', () => {
    audio.stopAlarmRingtone();
    ringingScreen.classList.remove('active');
    appState.user.successfulWakeups += 1;
    saveAppState();
    renderDashboard();
  });

  // Emergency SOS hold button (10-second hold)
  const btnSos = document.getElementById('btn-emergency-sos');
  const sosTrack = document.getElementById('sos-hold-track');
  const sosFill = document.getElementById('sos-hold-fill');
  let holdStart = 0;
  let holdInterval = null;

  function startHold(e) {
    e.preventDefault();
    sosTrack.style.display = 'block';
    holdStart = Date.now();
    sosFill.style.width = '0%';

    holdInterval = setInterval(() => {
      const elapsed = Date.now() - holdStart;
      const pct = Math.min(100, (elapsed / 10000) * 100);
      sosFill.style.width = `${pct}%`;

      if (elapsed >= 10000) {
        clearInterval(holdInterval);
        emergencyDisarmAlarm();
      }
    }, 100);
  }

  function endHold() {
    if (holdInterval) clearInterval(holdInterval);
    sosFill.style.width = '0%';
    sosTrack.style.display = 'none';
  }

  btnSos.addEventListener('mousedown', startHold);
  btnSos.addEventListener('touchstart', startHold);
  window.addEventListener('mouseup', endHold);
  window.addEventListener('touchend', endHold);
}

function emergencyDisarmAlarm() {
  audio.stopAlarmRingtone();
  document.getElementById('screen-alarm-ringing').classList.remove('active');
  appState.user.streak = 1;
  appState.user.xp = Math.max(0, appState.user.xp - 50);
  saveAppState();
  renderDashboard();
  alert('⚠️ Emergency SOS Activated: Wake confirmation pinged to your dorm group. -50 XP penalty applied.');
}

// =============================================================================
// 7. SCREEN 4: ACTIVE PUZZLE GAME ENGINES (All 5 Games)
// =============================================================================

let activeGameTimer = null;
let activeGameRemainingTime = 20;
let activeGameTotalTime = 20;
let activeGameStartTime = 0;
let currentGameKey = 'maze';

function launchActiveGameChallenge(alarm) {
  currentGameKey = alarm.resolvedGameType || alarm.gameType || 'maze';
  if (currentGameKey === 'random') currentGameKey = pickRandomGameType();

  const gameScreen = document.getElementById('screen-game-playing');
  const missionLvl = document.getElementById('game-hud-mission-lvl');
  const synapseVal = document.getElementById('game-hud-synapse');
  const boardTitle = document.getElementById('game-board-title');
  const boardSub = document.getElementById('game-board-subtitle');

  // Muffle siren to 65% during challenge as per design
  audio.setMuffled(true);

  // Set difficulty timing
  if (alarm.difficulty === 'easy') activeGameTotalTime = 30;
  else if (alarm.difficulty === 'hard') activeGameTotalTime = 16;
  else activeGameTotalTime = 22;

  activeGameRemainingTime = activeGameTotalTime;
  activeGameStartTime = Date.now();

  missionLvl.textContent = alarm.difficulty === 'hard' ? 'MISSION LVL 05' : 'MISSION LVL 03';
  synapseVal.textContent = 'SYNAPSE 82%';

  // Hide all panels
  document.querySelectorAll('.game-mode-panel').forEach(p => p.classList.remove('active'));

  // Configure Game Headers
  if (currentGameKey === 'maze') {
    boardTitle.innerHTML = 'Maze Escape <span class="swirl-cyan">🌀</span>';
    boardSub.textContent = 'Guide the neural spark through the labyrinth to the awakening portal to disarm siren.';
    document.getElementById('panel-game-maze').classList.add('active');
    setupMazeGame(alarm.difficulty);
  } else if (currentGameKey === 'sequence') {
    boardTitle.innerHTML = 'Sequence Memory <span class="swirl-cyan">🧩</span>';
    boardSub.textContent = 'Memorize the illuminated pad pattern and repeat it in exact order.';
    document.getElementById('panel-game-sequence').classList.add('active');
    setupSequenceGame(alarm.difficulty);
  } else if (currentGameKey === 'cards') {
    boardTitle.innerHTML = 'Card Match <span class="swirl-cyan">🃏</span>';
    boardSub.textContent = 'Flip the neural tiles and pair all matching synaptic concepts.';
    document.getElementById('panel-game-cards').classList.add('active');
    setupCardsGame(alarm.difficulty);
  } else if (currentGameKey === 'pattern') {
    boardTitle.innerHTML = 'Pattern Recall <span class="swirl-cyan">⚡</span>';
    boardSub.textContent = 'Memorize the spatial matrix nodes, then tap all illuminated positions.';
    document.getElementById('panel-game-pattern').classList.add('active');
    setupPatternGame(alarm.difficulty);
  } else if (currentGameKey === 'color') {
    boardTitle.innerHTML = 'Color Memory <span class="swirl-cyan">🎵</span>';
    boardSub.textContent = 'Listen to the harmonic chime notes and replicate the color sequence.';
    document.getElementById('panel-game-color').classList.add('active');
    setupColorGame(alarm.difficulty);
  }

  // Start live timer
  updateGameTimerUI();
  if (activeGameTimer) clearInterval(activeGameTimer);
  activeGameTimer = setInterval(() => {
    activeGameRemainingTime -= 0.1;
    updateGameTimerUI();
    if (activeGameRemainingTime <= 0) {
      clearInterval(activeGameTimer);
      handleGameTimeLimit();
    }
  }, 100);

  gameScreen.classList.add('active');
}

function updateGameTimerUI() {
  const timerText = document.getElementById('game-hud-timer');
  const sec = Math.max(0, activeGameRemainingTime).toFixed(1);
  timerText.textContent = `ESCAPE IN ${String(sec).padStart(4, '0')}s`;
}

function handleGameTimeLimit() {
  audio.playSfxError();
  showToastAlert('⏰ Time pressure! Keep focusing to wake up!');
  activeGameRemainingTime = 15; // Give extra grace period rather than frustrating student
}

function showToastAlert(msg) {
  const toast = document.getElementById('game-toast-alert');
  const text = document.getElementById('game-toast-text');
  text.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2200);
}

function initChallengeEngines() {
  // Reset button in game
  document.getElementById('btn-game-reset').addEventListener('click', () => {
    audio.playSfxClick();
    if (currentGameKey === 'maze') setupMazeGame(activeAlarmSession ? activeAlarmSession.difficulty : 'medium');
    else if (currentGameKey === 'sequence') setupSequenceGame(activeAlarmSession ? activeAlarmSession.difficulty : 'medium');
    else if (currentGameKey === 'cards') setupCardsGame(activeAlarmSession ? activeAlarmSession.difficulty : 'medium');
    else if (currentGameKey === 'pattern') setupPatternGame(activeAlarmSession ? activeAlarmSession.difficulty : 'medium');
    else if (currentGameKey === 'color') setupColorGame(activeAlarmSession ? activeAlarmSession.difficulty : 'medium');
    showToastAlert('↺ Puzzle Reset');
  });

  // Snooze with penalty
  document.getElementById('btn-game-snooze-penalty').addEventListener('click', () => {
    audio.stopAlarmRingtone();
    if (activeGameTimer) clearInterval(activeGameTimer);
    document.getElementById('screen-game-playing').classList.remove('active');
    appState.user.streak = 1;
    appState.user.xp = Math.max(0, appState.user.xp - 50);
    appState.user.snoozes += 1;
    saveAppState();
    renderDashboard();
    alert('⏱ Emergency Snooze activated: -50 XP penalty applied and streak reset to 1 day.');
  });
}

// -----------------------------------------------------------------------------
// GAME 1: MAZE ESCAPE (Screenshot 3 Reference)
// -----------------------------------------------------------------------------
const MAZE_COLS = 6;
const MAZE_ROWS = 7;
let mazePlayerPos = { x: 2, y: 6 };
let mazeKeyPos = { x: 3, y: 3 };
let mazePortalPos = { x: 4, y: 0 };
let mazeHasKey = false;

// 0: path, 1: wall, 2: path with synapse dot
const mazeLayoutMap = [
  [1, 0, 0, 0, 0, 1], // row 0: portal at (4,0)
  [1, 0, 1, 1, 2, 1], // row 1
  [1, 0, 1, 1, 2, 1], // row 2
  [0, 2, 0, 0, 2, 0], // row 3: key at (3,3)
  [0, 1, 1, 1, 2, 1], // row 4
  [0, 1, 2, 2, 2, 0], // row 5
  [1, 0, 0, 1, 0, 0]  // row 6: player starts at (2,6)
];

function setupMazeGame(difficulty) {
  mazePlayerPos = { x: 2, y: 6 };
  mazeKeyPos = { x: 3, y: 3 };
  mazePortalPos = { x: 4, y: 0 };
  mazeHasKey = false;

  renderMazeGrid();
  attachMazeControls();
}

function renderMazeGrid() {
  const container = document.getElementById('maze-grid-matrix');
  container.innerHTML = '';

  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'maze-cell';
      cell.setAttribute('data-x', c);
      cell.setAttribute('data-y', r);

      const cellType = mazeLayoutMap[r][c];

      if (c === mazePlayerPos.x && r === mazePlayerPos.y) {
        cell.classList.add('player-cell');
      } else if (c === mazePortalPos.x && r === mazePortalPos.y) {
        cell.classList.add('portal-cell');
      } else if (!mazeHasKey && c === mazeKeyPos.x && r === mazeKeyPos.y) {
        cell.classList.add('key-node');
      } else if (cellType === 1) {
        cell.classList.add('wall');
      } else if (cellType === 2) {
        cell.classList.add('path-dot');
      }

      container.appendChild(cell);
    }
  }

  // Update Synapse HUD
  const synapseVal = document.getElementById('game-hud-synapse');
  const dist = Math.abs(mazePlayerPos.x - mazePortalPos.x) + Math.abs(mazePlayerPos.y - mazePortalPos.y);
  const synapsePct = Math.max(30, Math.min(100, Math.floor(100 - dist * 7)));
  synapseVal.textContent = `SYNAPSE ${synapsePct}%`;
}

function moveMazePlayer(dx, dy) {
  const nx = mazePlayerPos.x + dx;
  const ny = mazePlayerPos.y + dy;

  // Boundary check
  if (nx < 0 || nx >= MAZE_COLS || ny < 0 || ny >= MAZE_ROWS) {
    audio.playSfxError();
    return;
  }

  // Wall check
  if (mazeLayoutMap[ny][nx] === 1) {
    audio.playSfxError();
    return;
  }

  // Valid move
  mazePlayerPos = { x: nx, y: ny };
  audio.playSfxMove();

  // Check key pickup
  if (!mazeHasKey && nx === mazeKeyPos.x && ny === mazeKeyPos.y) {
    mazeHasKey = true;
    audio.playSfxKey();
    showToastAlert('🔑 Synapse Key collected! Portal activated.');
  }

  renderMazeGrid();

  // Check portal reached
  if (nx === mazePortalPos.x && ny === mazePortalPos.y) {
    setTimeout(completeChallengeSuccess, 300);
  }
}

let mazeControlsBound = false;
function attachMazeControls() {
  if (mazeControlsBound) return;
  mazeControlsBound = true;

  // D-Pad
  document.getElementById('btn-dpad-up').addEventListener('click', () => moveMazePlayer(0, -1));
  document.getElementById('btn-dpad-down').addEventListener('click', () => moveMazePlayer(0, 1));
  document.getElementById('btn-dpad-left').addEventListener('click', () => moveMazePlayer(-1, 0));
  document.getElementById('btn-dpad-right').addEventListener('click', () => moveMazePlayer(1, 0));

  // Desktop Keyboard Arrow & WASD keys
  window.addEventListener('keydown', (e) => {
    if (!document.getElementById('screen-game-playing').classList.contains('active')) return;
    if (currentGameKey !== 'maze') return;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); moveMazePlayer(0, -1); }
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); moveMazePlayer(0, 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); moveMazePlayer(-1, 0); }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); moveMazePlayer(1, 0); }
  });

  // Touch Swipe on Maze Board
  const mazeBoard = document.getElementById('maze-grid-matrix');
  let touchStartX = 0;
  let touchStartY = 0;

  mazeBoard.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  mazeBoard.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
      moveMazePlayer(dx > 0 ? 1 : -1, 0);
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 20) {
      moveMazePlayer(0, dy > 0 ? 1 : -1);
    }
  }, { passive: true });
}

// -----------------------------------------------------------------------------
// GAME 2: SEQUENCE MEMORY
// -----------------------------------------------------------------------------
let seqPattern = [];
let seqUserStep = 0;
let seqLocked = false;

function setupSequenceGame(difficulty) {
  const length = difficulty === 'hard' ? 6 : difficulty === 'easy' ? 4 : 5;
  seqPattern = [];
  for (let i = 0; i < length; i++) {
    seqPattern.push(Math.floor(Math.random() * 4));
  }
  seqUserStep = 0;
  seqLocked = true;

  document.getElementById('seq-steps-count').textContent = `0 / ${seqPattern.length}`;
  playSequenceDemonstration();

  // Attach pad listeners once
  const pads = document.querySelectorAll('.seq-neo-pad');
  pads.forEach(pad => {
    pad.onclick = () => {
      if (seqLocked) return;
      const padIdx = parseInt(pad.getAttribute('data-pad'), 10);
      flashSequencePad(padIdx);

      if (padIdx === seqPattern[seqUserStep]) {
        seqUserStep++;
        document.getElementById('seq-steps-count').textContent = `${seqUserStep} / ${seqPattern.length}`;

        if (seqUserStep === seqPattern.length) {
          setTimeout(completeChallengeSuccess, 400);
        }
      } else {
        audio.playSfxError();
        showToastAlert('❌ Pattern mismatch! Repeating sequence...');
        seqUserStep = 0;
        document.getElementById('seq-steps-count').textContent = `0 / ${seqPattern.length}`;
        setTimeout(playSequenceDemonstration, 700);
      }
    };
  });
}

function playSequenceDemonstration() {
  seqLocked = true;
  showToastAlert('👀 Watch the light sequence carefully...');

  let i = 0;
  const interval = setInterval(() => {
    if (i < seqPattern.length) {
      flashSequencePad(seqPattern[i]);
      i++;
    } else {
      clearInterval(interval);
      seqLocked = false;
      showToastAlert('👉 Now repeat the sequence!');
    }
  }, 650);
}

function flashSequencePad(index) {
  const pad = document.querySelector(`.seq-neo-pad.pad-${index}`);
  if (!pad) return;
  pad.classList.add('glow');
  audio.playSfxPad(index);
  setTimeout(() => pad.classList.remove('glow'), 350);
}

// -----------------------------------------------------------------------------
// GAME 3: CARD MATCH (4x4 Neural Pairs)
// -----------------------------------------------------------------------------
let cardPairsTotal = 6;
let cardPairsFound = 0;
let activeFlippedCards = [];
let cardsGridLocked = false;

function setupCardsGame(difficulty) {
  cardPairsTotal = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 8 : 6;
  cardPairsFound = 0;
  activeFlippedCards = [];
  cardsGridLocked = false;

  document.getElementById('cards-pairs-count').textContent = `0 / ${cardPairsTotal}`;

  const icons = ['🎓', '⚡', '🚀', '💡', '🏆', '💎', '🔥', '🎧'];
  const pool = icons.slice(0, cardPairsTotal);
  const deck = [...pool, ...pool].sort(() => Math.random() - 0.5);

  const grid = document.getElementById('cards-grid-matrix');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = cardPairsTotal === 4 ? 'repeat(4, 70px)' : 'repeat(4, 70px)';

  deck.forEach((symbol, idx) => {
    const card = document.createElement('div');
    card.className = 'card-item-3d flipped'; // Start with quick preview
    card.setAttribute('data-sym', symbol);
    card.setAttribute('data-id', idx);
    card.innerHTML = `
      <div class="card-face card-back">?</div>
      <div class="card-face card-front">${symbol}</div>
    `;

    card.addEventListener('click', () => onCardClicked(card));
    grid.appendChild(card);
  });

  // Preview peek for 1.8s then hide
  setTimeout(() => {
    document.querySelectorAll('.card-item-3d').forEach(c => c.classList.remove('flipped'));
    showToastAlert('Find all matching neural pairs!');
  }, 1800);
}

function onCardClicked(card) {
  if (cardsGridLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  audio.playSfxClick();
  card.classList.add('flipped');
  activeFlippedCards.push(card);

  if (activeFlippedCards.length === 2) {
    cardsGridLocked = true;
    const [c1, c2] = activeFlippedCards;
    const sym1 = c1.getAttribute('data-sym');
    const sym2 = c2.getAttribute('data-sym');

    if (sym1 === sym2) {
      audio.playSfxMatch();
      c1.classList.add('matched');
      c2.classList.add('matched');
      cardPairsFound++;
      document.getElementById('cards-pairs-count').textContent = `${cardPairsFound} / ${cardPairsTotal}`;
      activeFlippedCards = [];
      cardsGridLocked = false;

      if (cardPairsFound === cardPairsTotal) {
        setTimeout(completeChallengeSuccess, 450);
      }
    } else {
      audio.playSfxError();
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        activeFlippedCards = [];
        cardsGridLocked = false;
      }, 700);
    }
  }
}

// -----------------------------------------------------------------------------
// GAME 4: PATTERN RECALL (Matrix Grid)
// -----------------------------------------------------------------------------
let patternTargets = new Set();
let patternMatches = new Set();
let patternInteractive = false;

function setupPatternGame(difficulty) {
  const total = 16; // 4x4
  const count = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 6 : 5;

  patternTargets.clear();
  patternMatches.clear();
  patternInteractive = false;

  while (patternTargets.size < count) {
    patternTargets.add(Math.floor(Math.random() * total));
  }

  document.getElementById('pattern-nodes-count').textContent = `0 / ${count}`;

  const grid = document.getElementById('pattern-matrix-board');
  grid.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.className = 'matrix-cell';
    cell.setAttribute('data-idx', i);

    if (patternTargets.has(i)) {
      cell.classList.add('highlight');
    }

    cell.addEventListener('click', () => onPatternCellClick(cell, i));
    grid.appendChild(cell);
  }

  showToastAlert('👀 Memorize the glowing pattern nodes!');

  // Reveal for 2.2 seconds then hide
  setTimeout(() => {
    document.querySelectorAll('.matrix-cell').forEach(c => c.classList.remove('highlight'));
    patternInteractive = true;
    showToastAlert('👉 Tap all nodes from the pattern!');
  }, 2200);
}

function onPatternCellClick(cell, idx) {
  if (!patternInteractive || patternMatches.has(idx)) return;

  if (patternTargets.has(idx)) {
    audio.playSfxMatch();
    cell.classList.add('correct');
    patternMatches.add(idx);
    document.getElementById('pattern-nodes-count').textContent = `${patternMatches.size} / ${patternTargets.size}`;

    if (patternMatches.size === patternTargets.size) {
      patternInteractive = false;
      setTimeout(completeChallengeSuccess, 400);
    }
  } else {
    audio.playSfxError();
    cell.classList.add('wrong');
    setTimeout(() => cell.classList.remove('wrong'), 400);
  }
}

// -----------------------------------------------------------------------------
// GAME 5: COLOR MEMORY (Harmonic Simon Circle)
// -----------------------------------------------------------------------------
let colorSequence = [];
let colorUserIdx = 0;
let colorTurnLocked = false;

function setupColorGame(difficulty) {
  const length = difficulty === 'hard' ? 5 : difficulty === 'easy' ? 3 : 4;
  colorSequence = [];
  for (let i = 0; i < length; i++) {
    colorSequence.push(Math.floor(Math.random() * 5));
  }
  colorUserIdx = 0;
  colorTurnLocked = true;

  document.getElementById('color-step-count').textContent = `0 / ${colorSequence.length}`;
  playColorChimeSequence();

  // Attach slice clicks
  const slices = document.querySelectorAll('.color-slice');
  slices.forEach(slice => {
    slice.onclick = () => {
      if (colorTurnLocked) return;
      const colorVal = parseInt(slice.getAttribute('data-color'), 10);
      flashColorSlice(colorVal);

      if (colorVal === colorSequence[colorUserIdx]) {
        colorUserIdx++;
        document.getElementById('color-step-count').textContent = `${colorUserIdx} / ${colorSequence.length}`;

        if (colorUserIdx === colorSequence.length) {
          setTimeout(completeChallengeSuccess, 400);
        }
      } else {
        audio.playSfxError();
        showToastAlert('❌ Out of tune! Repeating chime pattern...');
        colorUserIdx = 0;
        document.getElementById('color-step-count').textContent = `0 / ${colorSequence.length}`;
        setTimeout(playColorChimeSequence, 800);
      }
    };
  });
}

function playColorChimeSequence() {
  colorTurnLocked = true;
  document.getElementById('color-turn-text').textContent = 'Listen';

  let i = 0;
  const timer = setInterval(() => {
    if (i < colorSequence.length) {
      flashColorSlice(colorSequence[i]);
      i++;
    } else {
      clearInterval(timer);
      colorTurnLocked = false;
      document.getElementById('color-turn-text').textContent = 'Your Turn';
      showToastAlert('Repeat the harmonic sequence in order!');
    }
  }, 650);
}

function flashColorSlice(colorIdx) {
  const slices = document.querySelectorAll('.color-slice');
  const slice = slices[colorIdx];
  if (!slice) return;

  slice.classList.add('active-glow');
  audio.playSfxPad(colorIdx);
  setTimeout(() => slice.classList.remove('active-glow'), 350);
}

// =============================================================================
// 8. SCREEN 5: CHALLENGE COMPLETE & RATING SCREEN (Section 10 Reference)
// =============================================================================

let lastGameElapsed = 12.8;

function completeChallengeSuccess() {
  if (activeGameTimer) clearInterval(activeGameTimer);

  // Stop siren sound completely & play victory fanfare
  audio.stopAlarmRingtone();
  audio.playVictoryFanfare();

  const elapsed = ((Date.now() - activeGameStartTime) / 1000).toFixed(1);
  lastGameElapsed = parseFloat(elapsed);

  // Update State metrics
  appState.user.successfulWakeups += 1;
  appState.user.missionsDone += 1;
  appState.user.xp += 50;
  appState.user.streak += 1;
  if (appState.user.streak > appState.user.bestStreak) {
    appState.user.bestStreak = appState.user.streak;
  }

  saveAppState();

  // Hide Game screen
  document.getElementById('screen-game-playing').classList.remove('active');

  // Populate Result Screen
  const resScreen = document.getElementById('screen-game-result');
  document.getElementById('res-time-val').textContent = `${elapsed}s`;
  document.getElementById('res-score-val').textContent = '950';
  document.getElementById('res-level-val').textContent = 'LVL 3';
  document.getElementById('res-streak-val').textContent = `${appState.user.streak}d 🔥`;

  // Personal Best check
  const pbBanner = document.getElementById('res-personal-best-banner');
  const pb = appState.personalBests[currentGameKey] || 15.0;
  if (lastGameElapsed < pb) {
    appState.personalBests[currentGameKey] = lastGameElapsed;
    saveAppState();
    document.getElementById('res-pb-text').textContent = `🌟 New Personal Best (${elapsed}s) for this challenge!`;
    pbBanner.style.display = 'inline-flex';
  } else {
    document.getElementById('res-pb-text').textContent = `⚡ Top 5% campus awakening speed!`;
    pbBanner.style.display = 'inline-flex';
  }

  // Confetti Canvas
  launchConfettiParticles();

  resScreen.classList.add('active');
}

function initResultScreen() {
  const starGlyphs = document.querySelectorAll('.star-glyph');
  const quoteLabel = document.getElementById('rating-feedback-quote');
  const tagChips = document.querySelectorAll('.rating-tag-chips-row .res-chip');
  const btnSubmit = document.getElementById('btn-submit-rating');
  const btnContinue = document.getElementById('btn-continue-result');
  const resScreen = document.getElementById('screen-game-result');

  let currentStars = 5;

  const quotes = {
    1: '😴 Very groggy, need gentler puzzle',
    2: '😐 Challenging while half-asleep',
    3: '🎯 Good moderate challenge',
    4: '⚡ Energizing and fast',
    5: '⭐ Loved it! Felt fully awake'
  };

  starGlyphs.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-star'), 10);
      currentStars = val;
      audio.playSfxPad(val);

      starGlyphs.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-star'), 10);
        s.classList.toggle('active', sVal <= val);
      });

      quoteLabel.textContent = quotes[val] || '';
    });
  });

  tagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      tagChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  function closeAndSaveRating() {
    // Record rating for game
    if (appState.gameRatings[currentGameKey]) {
      const record = appState.gameRatings[currentGameKey];
      record.count += 1;
      record.totalStars += currentStars;
      record.avg = parseFloat((record.totalStars / record.count).toFixed(1));
    }

    saveAppState();
    renderDashboard();
    renderGamesLibraryView();
    resScreen.classList.remove('active');
  }

  btnSubmit.addEventListener('click', closeAndSaveRating);
  btnContinue.addEventListener('click', closeAndSaveRating);
}

// Confetti Particle Simulation
function launchConfettiParticles() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  const particles = [];
  const palette = ['#00f5ff', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#ffffff'];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4,
      size: Math.random() * 8 + 4,
      color: palette[Math.floor(Math.random() * palette.length)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 4,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8
    });
  }

  let frames = 0;
  function step() {
    if (frames > 100) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rot += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
    frames++;
    requestAnimationFrame(step);
  }
  step();
}

// =============================================================================
// 9. TAB 2: GAMES MATRIX & RATINGS (Section 11 Reference)
// =============================================================================

function initGamesLibraryView() {
  renderGamesLibraryView();
}

function renderGamesLibraryView() {
  const container = document.getElementById('games-matrix-list');
  if (!container) return;
  container.innerHTML = '';

  const games = Object.entries(appState.gameRatings);
  games.forEach(([key, g]) => {
    const card = document.createElement('div');
    card.className = 'game-matrix-card';
    card.innerHTML = `
      <div class="game-card-top">
        <div class="game-card-left">
          <div class="game-avatar-box">${g.emoji}</div>
          <div class="game-title-group">
            <h3>${g.name}</h3>
            <p>${g.desc}</p>
          </div>
        </div>
        <span class="game-card-rating-badge">★ ${g.avg}</span>
      </div>
      <div class="game-card-metrics-grid">
        <div class="game-metric-col">
          <span class="game-metric-label">PLAYS</span>
          <span class="game-metric-value">${g.count}</span>
        </div>
        <div class="game-metric-col">
          <span class="game-metric-label">AVG TIME</span>
          <span class="game-metric-value">${g.avgTime || '13.5s'}</span>
        </div>
        <div class="game-metric-col">
          <span class="game-metric-label">BEST</span>
          <span class="game-metric-value">${appState.personalBests[key] || 9.5}s</span>
        </div>
      </div>
      <button type="button" class="btn-practice-game" data-game="${key}">
        <span>▶</span>
        <span>Practice Mission</span>
      </button>
    `;

    const btnPractice = card.querySelector('.btn-practice-game');
    btnPractice.addEventListener('click', () => {
      const mockAlarm = {
        name: `${g.name} Practice`,
        hour: 7, minute: 0, ampm: 'AM',
        difficulty: 'medium',
        sound: 'cyber-echo',
        resolvedGameType: key,
        antiSnooze: true
      };
      launchActiveGameChallenge(mockAlarm);
    });

    container.appendChild(card);
  });
}

// =============================================================================
// 10. TAB 3 & 4: STATS TELEMETRY & BADGES
// =============================================================================

function renderStatsDataForRange(range) {
  // Dynamically update stats based on selected filter
  const currentStreak = document.getElementById('stats-current-streak-val');
  const bestStreak = document.getElementById('stats-best-streak-val');
  const trendBadge = document.getElementById('stats-speed-trend-badge');
  const circadianVal = document.getElementById('circadian-score-val');

  if (range === '30d') {
    if (currentStreak) currentStreak.textContent = '18';
    if (bestStreak) bestStreak.textContent = '21';
    if (trendBadge) trendBadge.innerHTML = '<span class="trend-arrow">↘</span><span>-44.5%</span>';
    if (circadianVal) circadianVal.textContent = '94.8';
  } else if (range === 'all') {
    if (currentStreak) currentStreak.textContent = `${appState.user.streak}`;
    if (bestStreak) bestStreak.textContent = `${appState.user.bestStreak}`;
    if (trendBadge) trendBadge.innerHTML = '<span class="trend-arrow">↘</span><span>-58.2%</span>';
    if (circadianVal) circadianVal.textContent = '96.4';
  } else {
    // 7d default
    if (currentStreak) currentStreak.textContent = `${appState.user.streak}`;
    if (bestStreak) bestStreak.textContent = `${appState.user.bestStreak}`;
    if (trendBadge) trendBadge.innerHTML = '<span class="trend-arrow">↘</span><span>-50.0%</span>';
    if (circadianVal) circadianVal.textContent = '96.4';
  }
}

function initBadgesView() {
  const container = document.getElementById('badges-grid-container');
  if (!container) return;
  container.innerHTML = '';

  appState.achievements.forEach(ach => {
    const tile = document.createElement('div');
    tile.className = `badge-tile-item ${ach.unlocked ? 'unlocked' : 'locked'}`;
    tile.innerHTML = `
      <span class="badge-tile-icon">${ach.icon}</span>
      <h4 class="badge-tile-name">${ach.title}</h4>
      <p class="badge-tile-desc">${ach.desc}</p>
      <span class="badge-tile-progress">${ach.unlocked ? '✓ Unlocked' : ach.progress}</span>
    `;
    container.appendChild(tile);
  });
}
