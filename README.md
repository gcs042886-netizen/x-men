# ⏰ WakeUp Challenge
> **Cognitive Anti-Snooze Brain Alarm for Students**  
> An ultra-premium, mobile-first web app recreating the high-tech cyberpunk telemetry and neomorphic visual language of the reference UI design.

---

## 🌟 Overview & Core Concept

**WakeUp Challenge** is designed for students who battle sleep inertia and compulsive morning snoozing. Rather than allowing effortless dismissals or frustrating users with academic calculus, WakeUp Challenge enforces **tactile, spatial, and cognitive brain missions** (like navigating a high-tech neural maze or reproducing harmonic memory sequences).

When **Anti-Snooze Mode** is active:
1. Standard alarm dismiss and snooze buttons are completely locked out.
2. The alarm tone continues sounding at up to 95dB emergency synth volume.
3. The student enters an interactive, 10–30s cognitive puzzle challenge:
   - **🌀 Maze Escape**: Guide the neural spark through the labyrinth to the awakening portal.
   - **🧩 Sequence Memory**: Memorize and reproduce illuminated pad patterns.
   - **🃏 Card Match**: 4×4 neural grid card pairing.
   - **⚡ Pattern Recall**: Spatial matrix memory retention.
   - **🎵 Color Memory**: Harmonic Simon-style pitch and color sequences.
   - **🎲 Random Game**: Rotates puzzles to prevent drowsiness habituation.
4. During gameplay, the siren drops to **65% muffled** to allow focused problem solving.
5. Successfully reaching the goal immediately disarms the siren, plays a victory fanfare, releases celebratory confetti, awards XP & streak milestones, and collects user feedback (*"How was this challenge?"*).

---

## 📱 Visual Reference & Screen Mapping

| Design Screen | Feature Area | Description |
| :--- | :--- | :--- |
| **Screenshot 4** | **Dashboard (`Alarms` Tab)** | Welcome banner, live local sync clock, hero active alarm card (`07:00 AM`, `School — Physics 101`, `Cyber Echo`, day capsules), Smart Difficulty progress card, 3 stat metrics (Streak, Solved, Speed), upcoming alarms list, and prominent `+ Set Alarm +` button. |
| **Screenshot 2** | **Set Alarm Modal** | Giant digital time picker with ghost digits, AM/PM toggle, `-15m`/`+15m`/`+30m` quick adjust pills, mission label, weekday repetitions, Required Brain Mission card with mandatory badge, difficulty segment (`Easy`, `Medium`, `Extreme`), Hardcore Anti-Snooze Lock, Force Max Escalation, animated EQ visualizer, and synchronized save button. |
| **Screenshot 5** | **Alarm Triggered Screen** | Fullscreen alarm interface with `ANTI-SNOOZE LOCK ACTIVE 100%` banner, multi-ring pulsating bell with soundwaves, `7:00 AM` digits, `90 dB MAXIMUM` 10-dot siren meter, challenge preview box, `START CHALLENGE ⚡` CTA, and 10s Emergency SOS hold option. |
| **Screenshot 3** | **Maze Escape Gameplay** | `SIREN: 65% MUFFLED` equalizer bar, HUD (`MISSION LVL 03`, `ESCAPE IN 15.0s`, `SYNAPSE 82%`), 6×7 high-tech labyrinth board with spark player, energy key node, purple path dots, tactile D-Pad, touch swipe, keyboard controls, reset, and snooze penalty. |
| **Screenshot 1** | **Telemetry & Stats (`Stats` Tab)** | `TELEMETRY V2.4 LIVE` header, `7 Days` / `30 Days` / `All-Time` filter pills, Current Streak (`7d`, `Top 5% campus rank`) and Best Streak (`21d`, `PB`) cards, Cognitive Wake Speed glowing SVG curved chart, Wake Cadence Precision bar chart with early/exact/late color coding, Circadian Stability Index (`96.4 / 100`), and Brain Mission Mastery progress tracks. |

---

## 🎮 Playable Brain Games Matrix

1. **Maze Escape (Gyro Labyrinth)**:
   - User controls a glowing cyan neural spark `⚡` in a 6×7 labyrinth.
   - Collect the center energy key `🔑` to awaken the top-right portal `🌀`.
   - Control via the **tactile D-Pad** (Up, Left, Center, Right, Down), **touch swipes**, or **desktop arrow/WASD keys**.
2. **Sequence Memory**:
   - 4 high-tech illuminated pads flash an expanding sequence.
   - User replicates the sequence in exact order to advance.
3. **Card Match (4×4 Grid)**:
   - 16 memory tiles with 3D flip animation.
   - Initial 1.8s peek to memorize neural icons (`🎓`, `⚡`, `🚀`, `💡`, `🏆`, `💎`, `🔥`, `🎧`).
4. **Pattern Recall**:
   - High-tech 4×4 matrix illuminates target nodes for 2.2s.
   - Reconstruct the pattern by tapping all illuminated tiles.
5. **Color Memory (Harmonic Simon Circle)**:
   - 5 harmonic colored slices (Red, Blue, Green, Yellow, Violet) with distinct synthesized pitches.
   - Listen to the harmonic chime notes and replicate the sequence.
6. **Random Game Mode**:
   - Dynamically selects one of the 5 challenges each morning to prevent physical auto-dismissal habits.

---

## 🔊 Built-in Web Audio API Synthesizer

No external MP3 files are required. The application contains an internal multi-channel Web Audio synthesizer generating:
* **Cyber Echo**: 95dB sawtooth pulse with pitch escalation.
* **Sunrise Melody**: Harmonic pentatonic chime sequence (C5, E5, G5, A5, C6).
* **Digital Siren**: Urgent dual-frequency alternating siren tone.
* **Energetic Chime**: Bright ascending arpeggio notes.
* **Dynamic Lowpass Muffling**: Automatically drops siren output to 65% (750Hz cutoff) when puzzle starts.
* **Interactive SFX**: Tactile clicks, d-pad motion tones, card flips, match chimes, error buzzers, and victory fanfare.

---

## 🚀 How to Run & Test

1. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Click **"Test Alarm in 3s"** in the top demo controls bar or click **"Test This Alarm Now"** on the dashboard hero card to trigger the alarm immediately.
3. Test the **Anti-Snooze lock**: click **"START CHALLENGE ⚡"** to play **Maze Escape** with the tactile D-Pad or arrow keys.
4. Explore all 4 tabs via the bottom navigation:
   - **⏰ Alarms**: Dashboard, hero alarm, upcoming alarms, "+ Set Alarm +" button.
   - **🎮 Games**: Games matrix with community ratings and "Practice Mission" buttons to test all 5 games on demand.
   - **📊 Stats**: Telemetry v2.4, Cognitive Wake Speed SVG curve, Wake Cadence Precision, Circadian Stability Index.
   - **🏆 Badges**: Campus dorm ranking, XP level progress, and unlocked achievement badges.
5. Toggle between mobile mockup frame and full-screen responsive mode using the **📱 Frame** button in the header.
