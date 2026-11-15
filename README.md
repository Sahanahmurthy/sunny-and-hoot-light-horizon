# 🦉 Curious Cosmo: Chasing the Light Horizon

**NASA Space Apps Challenge 2026 Submission**  
An interactive, browser-based astronaut survival simulator and educational mission trainer guiding players from the Lunar South Pole to Mars and out to Voyager 1's **1 Light-Day** milestone.

---

## 🚀 Overview
Alongside **Cadet Sunny** and **Hoot the Space Owl**, players step into the role of Junior Flight Director across three deep-space chapters. Every decision involves real aerospace life-support trade-offs—balancing oxygen, radiation shielding, crew musculoskeletal stamina, and spacecraft power budgets—backed by live NASA Open APIs and real physics equations.

### ✨ Key Features
* **3-Chapter Interactive Mission Arc:**
  1. **Lunar Base (Shackleton Crater):** Real-time solar flare shielding using exponential radiation attenuation ($D = D_0 e^{-\mu x}$).
  2. **Mars Outpost (Jezero Crater):** Managing a 14-minute signal delay and crew EVA stamina during Martian dust-storm solar array maintenance.
  3. **Interstellar Relay (Voyager 1):** Shedding non-essential instrument loads within Voyager 1's decaying Plutonium-238 RTG power budget ($P(t) = P_0 e^{-\lambda t}$) as it approaches 1 Light-Day (24 hours / ~16.09 billion miles) from Earth.
* **Live NASA Telemetry & Physics Engine:** Syncs live solar flare alerts and study metadata on startup (with resilient offline fallbacks) and computes Voyager 1's real-time distance and one-way light delay down to sub-second precision.
* **Spacesuit Customizer Locker:** Unlock and equip mission patches (**NASA Artemis**, **Mars Perseverance**, **Voyager Golden Record**) across three spacesuit colorways.
* **V-G-R Light-Horizon Beacon:** Synthesizes audio-visual Morse code (`V - G - R`) via the Web Audio API.
* **Official PDF Mission Certificate:** Composites the player's call sign, suit colorway template, and earned circular mission patches onto an HTML5 `<canvas>` and exports a downloadable PDF via `jsPDF`.

---

## 📊 NASA Data & Open APIs Integrated
* **NASA DONKI (`FLR` Endpoint):** Live solar flare classifications driving Chapter 1 space-weather hazards.
* **NASA OSDR (Study `OSD-48`):** *Spaceflight Musculoskeletal Adaptation* data informing Mars crew exercise and EVA fatigue mechanics.
* **NASA LRO (Lunar Reconnaissance Orbiter):** Shackleton Crater water-ice extraction and lunar south pole thermal/radiation trade-offs.
* **NASA/JPL Voyager Telemetry:** Voyager 1 velocity (~10.56 mi/s), 1977–2026 Pu-238 RTG decay (87.7-year half-life), and the November 18, 2026 1 Light-Day milestone.

---

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Graphics & Audio:** HTML5 Canvas API, Web Audio API
* **PDF Generation:** `jsPDF`
* **Deployment:** GitHub Pages

---

## 💻 Running Locally
Because the certificate generator renders local image assets onto an HTML5 `<canvas>`, run the project through a local HTTP server (to avoid `file://` CORS restrictions):

```bash
# Using Python
python -m http.server 8000
# Then open http://localhost:8000 in your browser
