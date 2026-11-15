// === NASA OPEN API & ENGINEERING PHYSICS ENGINE (CURIOUS COSMO) ===
const NASA_API_KEY = "rMLhD9jpcPWhMq9DDm7QJkL7BMWrMRDkf7qP7bmF";

const NASA_TELEMETRY = {
  donki: { flareClass: "X1.2", peakTime: "2026-11-12T14:22Z", source: "NASA DONKI Feed" },
  radlab: { baselineDoseMicroGyDay: 485.0, waterAttenuationCoeff: 0.042 },
  osdr: { title: "Spaceflight Musculoskeletal Adaptation", studyId: "OSD-48" }
};

// Real Radiation Attenuation Calculation: D = D0 * e^(-mu * x)
function calculateShieldedDose(waterThicknessCm) {
  const d0 = NASA_TELEMETRY.radlab.baselineDoseMicroGyDay;
  const mu = NASA_TELEMETRY.radlab.waterAttenuationCoeff;
  const attenuatedDose = d0 * Math.exp(-mu * waterThicknessCm);
  return Math.round(attenuatedDose * 10) / 10;
}

// Voyager 1 Plutonium-238 Radioactive Decay: P(t) = P0 * e^(-lambda * t)
function calculateVoyagerPower() {
  const p0 = 470.0;      // Initial power at launch in 1977 (Watts)
  const halfLife = 87.7; // Pu-238 half-life in years
  const lambda = Math.LN2 / halfLife;

  const launchYear = 1977;
  const currentYear = new Date().getFullYear();
  const elapsedYears = currentYear - launchYear;

  const currentPower = p0 * Math.exp(-lambda * elapsedYears);
  return Math.round(currentPower * 10) / 10;
}

// Life Support Safeguard & Emergency Abort Check
function checkLifeSupportSafeguards() {
  if (state.o2 <= 0 || state.shield <= 0 || state.health <= 0) {
    if (state.activeTimer) clearInterval(state.activeTimer);

    const container = document.getElementById("choices-container") || document.body;
    container.classList.remove("hidden");
    container.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.15); border: 2px solid #ef4444; padding: 1.5rem; border-radius: 12px; text-align: center; color: #f87171;">
        <h2 style="margin-bottom: 0.5rem;">🚨 MISSION EMERGENCY ABORT 🚨</h2>
        <p style="font-size: 0.95rem; color: #cbd5e1; margin-bottom: 1rem;">
          Critical life support failure detected! Habitat systems could not sustain parameters against deep space telemetry extremes.
        </p>
        <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.2rem;">
          Final Status — Air (O₂): ${state.o2}% | Shielding: ${state.shield}% | Crew Health: ${state.health}%
        </div>
        <button onclick="startStory()" style="background: #ef4444; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 8px; font-weight: bold; cursor: pointer;">
          🔄 RESTART MISSION
        </button>
      </div>
    `;
    return true;
  }
  return false;
}

async function syncRealNasaApis() {
  const statusEl = document.getElementById("live-nasa-feed-badge");
  let donkiLive = false;
  let osdrLive = false;

  // 1. Live NASA DONKI Solar Flare API (30-day window)
  try {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const flrUrl = `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${NASA_API_KEY}`;

    const flrRes = await fetch(flrUrl);
    if (flrRes.ok) {
      const flares = await flrRes.json();
      if (Array.isArray(flares) && flares.length > 0) {
        const latest = flares[flares.length - 1];
        NASA_TELEMETRY.donki.flareClass = latest.classType || "M5.4";
        NASA_TELEMETRY.donki.peakTime = (latest.peakTime || end).replace("T", " ").replace("Z", " UTC");
        donkiLive = true;
      }
    }
  } catch (err) {
    console.warn("DONKI fallback telemetry active:", err);
  }

  // 2. Live NASA OSDR Biological Study Metadata API (Study OSD-48)
  try {
    const osdrUrl = "https://osdr.nasa.gov/osdr/data/osd/meta/48";
    const osdrRes = await fetch(osdrUrl);
    if (osdrRes.ok) {
      const osdrData = await osdrRes.json();
      const studyMeta = osdrData?.study?.["OSD-48"]?.studies?.[0];
      if (studyMeta?.title) {
        NASA_TELEMETRY.osdr.title = studyMeta.title;
        osdrLive = true;
      }
    }
  } catch (err) {
    console.warn("OSDR fallback metadata active:", err);
  }

  // Update Top Live Telemetry Banner
  if (statusEl) {
    statusEl.innerHTML = `
      ${donkiLive ? "🟢" : "🟡"} <strong>NASA DONKI:</strong> Flare ${NASA_TELEMETRY.donki.flareClass} &nbsp;|&nbsp;
      ${osdrLive ? "🟢" : "🟡"} <strong>NASA OSDR (${NASA_TELEMETRY.osdr.studyId}):</strong> Musculoskeletal Telemetry Linked &nbsp;|&nbsp;
      🛰️ <strong>JPL DSN:</strong> Voyager 1 RTG Active
    `;
    statusEl.style.color = "#4ade80";
  }
}

// === STORY CHAPTERS + HANDS-ON MINI-GAMES ===
const STORY_SCENES = [
  {
    chapter: "Chapter 1: Lunar Base (Shackleton Crater)",
    bgClass: "moon-bg",
    emoji: "🚨🦉⚡",
    caption: "CHAPTER 1 • LUNAR SOUTH POLE • DELAY: 1.3s",
    delay: "1.3s",
    speaker: "🦉 Hoot's DONKI Space Weather Alert",
    story: "HOOT-HOOT!! We just landed at Shackleton Crater, and NASA's DONKI satellite spotted an X-Class Solar Flare racing toward the Moon! How do we use our lunar ice reserves?",
    minigameType: "shieldPump",
    choices: [
      {
        title: "🛡️ Divert Water-Ice to Radiation Walls (Sacrifice Crop Water)",
        tradeoff: "Trade-off: Unlocks full Shield Pump power! (-10% Air)",
        effects: { o2: -10, shield: +20, health: +5 },
        pumpBoost: 14,
        nasaFact: "NASA's DONKI tracks real Coronal Mass Ejections. Hydrogen-rich water walls block dangerous radiation far better than metal!"
      },
      {
        title: "🌱 Save Water for Hydroponic Crops & Pump Slowly",
        tradeoff: "Trade-off: Keeps Air/Farm high (+10% Air), but Shield Pump works harder!",
        effects: { o2: +10, shield: +5, health: -5 },
        pumpBoost: 9,
        nasaFact: "Every liter of water mined from Shackleton Crater's ice is split between drinking, oxygen, farming, and radiation shielding."
      }
    ],
    unlockPatch: { id: "artemis", icon: "🌓", image: "assets/patch-artemis.png", name: "NASA Artemis Patch", trivia: "🎉 You shielded the base from the solar storm and earned the Artemis Patch!" }
  },
  {
    chapter: "Chapter 2: Mars Outpost (Jezero Crater)",
    bgClass: "mars-bg",
    emoji: "🧑‍🚀🦉🔴",
    caption: "CHAPTER 2 • JEZERO CRATER, MARS • DELAY: 14 MINS",
    delay: "14 min",
    speaker: "🦉 Hoot & Sunny",
    story: "Touchdown on Mars! Signals take 14 MINUTES to arrive, and a red dust storm just covered our solar panels. Did you schedule Sunny's NASA OSDR gym workout?",
    minigameType: "dustWiper",
    choices: [
      {
        title: "💪 Yes! Sunny Did OSDR Exercise & Goes Outside to Clean Panels",
        tradeoff: "Trade-off: +15% Health & fast dust-wiping speed! (-10% Air)",
        effects: { o2: -10, shield: 0, health: +15 },
        nasaFact: "NASA OSDR research proves astronauts need daily resistive exercise in low gravity to stay strong for Martian EVAs."
      },
      {
        title: "🔬 Skip Workout & Run MOXIE Oxygen Maker Inside",
        tradeoff: "Trade-off: +20% Air from Martian CO₂, but heavier suit (-10% Health)",
        effects: { o2: +20, shield: +5, health: -10 },
        nasaFact: "Perseverance's MOXIE proved we can manufacture oxygen straight from Mars's 95% CO₂ atmosphere!"
      }
    ],
    unlockPatch: { id: "perseverance", icon: "🛸", image: "assets/patch-mars.png", name: "Mars Perseverance Patch", trivia: "🎉 Solar array clean! You earned the Mars Perseverance Patch!" }
  },
  {
    chapter: "Chapter 3: Interstellar Relay (Voyager 1)",
    bgClass: "space-bg",
    emoji: "🛰️🦉✨",
    caption: "CHAPTER 3 • DEEP SPACE • DELAY: 24 HOURS (1 LIGHT-DAY)",
    delay: "24 hrs",
    speaker: "🦉 Hoot's Deep-Space Telemetry",
    story: "We caught up with Voyager 1—16.09 billion miles away! Its nuclear battery dropped to ~215W. Flip off non-essential instruments before the fuse blows!",
    minigameType: "voyagerBreakers",
    choices: [
      {
        title: "🔌 Prioritize Main Dish & Thermal Heater (Load-Shedding)",
        tradeoff: "Trade-off: Turns off old cameras to keep Voyager talking to Earth",
        effects: { o2: +10, shield: +15, health: +10 },
        nasaFact: "NASA/JPL engineers carefully shut down Voyager 1's instruments so its shrinking plutonium battery keeps the transmitter alive."
      },
      {
        title: "📡 Squeeze One Last Science Burst Before Shutting Down",
        tradeoff: "Trade-off: Extra science data, tight power margin",
        effects: { o2: -10, shield: +10, health: +5 },
        nasaFact: "At 1 Light-Day away, a command from Earth takes 24 hours just to reach Voyager!"
      }
    ],
    unlockPatch: { id: "voyager", icon: "📀", image: "assets/patch-voyager.png", name: "Voyager Golden Record", trivia: "🎉 Voyager 1 saved across 1 Light-Day! Final patch unlocked!" }
  }
];

let state = {
  sceneIdx: 0, o2: 80, shield: 70, health: 80,
  unlockedPatches: [], selectedPatchIcon: null,
  suitSlots: { leftArm: null, chest: null, rightArm: null },
  suitColor: "white", pendingNextStep: null, activeTimer: null,
  playerName: ""
};

function initGame() {
  syncRealNasaApis();
  bindButtons();
  updateLiveVoyagerTelemetry();
  setInterval(updateLiveVoyagerTelemetry, 1000);
}

function startStory() {
  clearInterval(state.activeTimer);

  const nameInput = document.getElementById("player-name-input");
  const enteredName = nameInput && nameInput.value.trim() !== ""
    ? nameInput.value.trim()
    : "Commander Sunny";

  state = {
    sceneIdx: 0, o2: 80, shield: 70, health: 80,
    unlockedPatches: [], selectedPatchIcon: null,
    suitSlots: { leftArm: null, chest: null, rightArm: null },
    suitColor: "white", pendingNextStep: null, activeTimer: null,
    playerName: enteredName
  };

  document.getElementById("intro-screen")?.classList.add("hidden");
  document.getElementById("finale-screen")?.classList.add("hidden");
  document.getElementById("story-screen")?.classList.remove("hidden");
  renderScene();
}

function renderScene() {
  const scene = STORY_SCENES[state.sceneIdx];
  document.getElementById("chapter-label").textContent = scene.chapter;
  document.getElementById("stat-delay").textContent = scene.delay;
  updateStatsUI();

  const art = document.getElementById("scene-art");
  if (art) art.className = `scene-art ${scene.bgClass}`;
  document.getElementById("scene-emoji").textContent = scene.emoji;
  document.getElementById("scene-banner").textContent = scene.caption;
  document.getElementById("speaker-name").textContent = scene.speaker;

  const storyEl = document.getElementById("story-text");
  if (state.sceneIdx === 0) {
    storyEl.innerHTML = `HOOT-HOOT!! We just landed at <strong>Shackleton Crater (NASA LRO Data)</strong>, and NASA's live <strong>DONKI</strong> satellite feed detected a <strong>Class ${NASA_TELEMETRY.donki.flareClass} Solar Flare</strong>! How do we use our lunar ice reserves?`;
  } else if (state.sceneIdx === 1) {
    storyEl.innerHTML = `Touchdown on Mars! Signals take <strong>14 MINUTES</strong> to arrive, and a dust storm covered our solar panels. According to <strong>NASA OSDR Study ${NASA_TELEMETRY.osdr.studyId}</strong> (<em>"${NASA_TELEMETRY.osdr.title}"</em>), microgravity weakens muscles fast—did Sunny complete today's resistive workout?`;
  } else if (state.sceneIdx === 2) {
    const liveWatts = calculateVoyagerPower();
    storyEl.innerHTML = `We caught up with <strong>Voyager 1</strong>—over 16.09 billion miles away! Live <strong>NASA/JPL RTG decay telemetry</strong> shows its nuclear battery is down to <strong>${liveWatts}W</strong>. Flip off non-essential instruments before the fuse blows!`;
  } else {
    storyEl.textContent = scene.story;
  }

  document.getElementById("minigame-box")?.classList.add("hidden");
  document.getElementById("outcome-box")?.classList.add("hidden");

  const choicesEl = document.getElementById("choices-container");
  choicesEl.classList.remove("hidden");
  choicesEl.innerHTML = "";

  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerHTML = `<span class="choice-title">${choice.title}</span><span class="choice-tradeoff">${choice.tradeoff}</span>`;
    btn.onclick = () => launchMiniGame(scene, choice);
    choicesEl.appendChild(btn);
  });
}

function launchMiniGame(scene, choice) {
  state.o2 = clamp(state.o2 + (choice.effects.o2 || 0));
  state.shield = clamp(state.shield + (choice.effects.shield || 0));
  state.health = clamp(state.health + (choice.effects.health || 0));
  updateStatsUI();

  if (checkLifeSupportSafeguards()) {
    return;
  }

  document.getElementById("choices-container")?.classList.add("hidden");
  document.getElementById("minigame-box")?.classList.remove("hidden");

  if (scene.minigameType === "shieldPump") runShieldPumpGame(choice);
  else if (scene.minigameType === "dustWiper") runDustWiperGame(choice);
  else if (scene.minigameType === "voyagerBreakers") runCircuitBreakerGame(choice);
}

function runShieldPumpGame(choice) {
  document.getElementById("mg-title").textContent = "🛡️ Pump Water Into Radiation Walls!";
  document.getElementById("mg-instructions").textContent = "Rapidly tap the button below to pump water-ice and drop radiation levels to safe limits!";
  const arena = document.getElementById("mg-arena");

  let waterCm = 5;
  let timeLeft = 10;
  document.getElementById("mg-timer").textContent = `⏱️ ${timeLeft}s`;

  arena.innerHTML = `
    <div style="margin-bottom: 0.8rem; font-size: 0.95rem; color: #38bdf8;">
      📊 Live Dosimeter Dose: <strong id="dosimeter-val" style="color: #f87171;">485.0 µGy/day</strong>
    </div>
    <div class="pump-meter-bg"><div id="pump-fill" class="pump-meter-fill" style="width: 20%">5 cm</div></div>
    <button id="btn-pump-water" class="btn-pump">💧 PUMP WATER! (TAP FAST!)</button>
  `;

  document.getElementById("btn-pump-water").onclick = () => {
    playSpaceSfx("pump");
    waterCm = Math.min(65, waterCm + (choice.pumpBoost || 12));
    const currentDose = calculateShieldedDose(waterCm);
    const fillPercent = Math.round((waterCm / 65) * 100);

    document.getElementById("pump-fill").style.width = `${fillPercent}%`;
    document.getElementById("pump-fill").textContent = `${waterCm} cm`;

    const dosimeterEl = document.getElementById("dosimeter-val");
    if (dosimeterEl) {
      dosimeterEl.textContent = `${currentDose} µGy/day`;
      dosimeterEl.style.color = currentDose < 50 ? "#4ade80" : "#f87171";
    }

    if (waterCm >= 60 || currentDose <= 40) {
      clearInterval(state.activeTimer);
      finishMiniGame("Solar Storm Attenuated Successfully!", `Radiation dropped safely to ${currentDose} µGy/day using hydrogen-rich water shielding!`, choice.nasaFact);
    }
  };

  state.activeTimer = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("mg-timer").textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(state.activeTimer);
      const finalDose = calculateShieldedDose(waterCm);
      finishMiniGame("Solar Flare Passed!", `Final radiation dose stabilized at ${finalDose} µGy/day.`, choice.nasaFact);
    }
  }, 1000);
}

function runDustWiperGame(choice) {
  const didWorkout = choice.effects.health > 0;
  document.getElementById("mg-title").textContent = "🧹 Wipe Martian Dust Off Solar Array!";
  document.getElementById("mg-instructions").textContent = didWorkout
    ? "OSDR Workout Complete! High EVA muscle stamina—hover or click to rapidly clear all 8 panels!"
    : "Skipped OSDR Workout! Muscle fatigue active—click each dusty tile twice to scrub it clean!";

  const arena = document.getElementById("mg-arena");
  let cleaned = 0, timeLeft = 12;
  document.getElementById("mg-timer").textContent = `⏱️ ${timeLeft}s`;

  const statusBanner = document.createElement("div");
  statusBanner.style.cssText = "margin-bottom: 0.8rem; font-size: 0.9rem; color: #38bdf8;";
  statusBanner.innerHTML = `🧬 <strong>NASA OSDR (${NASA_TELEMETRY.osdr.studyId}) EVA Stamina:</strong> <strong style="color: ${didWorkout ? "#4ade80" : "#f87171"};">${didWorkout ? "100% Optimal (1-Swipe Clean)" : "65% Fatigued (2-Tap Scrub Required)"}</strong>`;

  const grid = document.createElement("div");
  grid.className = "solar-grid";
  for (let i = 0; i < 8; i++) {
    const tile = document.createElement("button");
    tile.className = "solar-tile dusty";
    tile.textContent = "🌫️";
    let tapsNeeded = didWorkout ? 1 : 2;

    const clean = () => {
      if (tile.classList.contains("clean")) return;
      playSpaceSfx("pump");
      tapsNeeded--;
      if (tapsNeeded > 0) {
        tile.textContent = "💨";
        return;
      }
      tile.className = "solar-tile clean";
      tile.textContent = "☀️";
      cleaned++;
      if (cleaned >= 8) {
        clearInterval(state.activeTimer);
        finishMiniGame("Panels 100% Clean!", "Sunny brushed off the Martian dust, restoring full solar array output!", choice.nasaFact);
      }
    };
    tile.onclick = clean;
    if (didWorkout) tile.onmouseenter = clean;
    grid.appendChild(tile);
  }
  arena.innerHTML = "";
  arena.appendChild(statusBanner);
  arena.appendChild(grid);

  state.activeTimer = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("mg-timer").textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(state.activeTimer);
      finishMiniGame(`Cleaned ${cleaned}/8 Panels!`, "Sunlight restored to Jezero Base.", choice.nasaFact);
    }
  }, 1000);
}

function runCircuitBreakerGame(choice) {
  document.getElementById("mg-title").textContent = "🛰️ Voyager 1 Power Rerouting & RTG Telemetry";
  document.getElementById("mg-instructions").textContent = "Plutonium-238 decay is dropping available wattage. Re-route circuit breakers to keep the Golden Record beacon alive!";
  const arena = document.getElementById("mg-arena");
  document.getElementById("mg-timer").textContent = "⚡ RTG";

  const livePower = calculateVoyagerPower();
  let systemLoad = 235.0;

  arena.innerHTML = `
    <div style="margin-bottom: 0.8rem; font-size: 0.95rem; color: #38bdf8;">
      ⚡ RTG Power Capacity: <strong style="color: #4ade80;">${livePower} W</strong> 
      <span style="font-size: 0.8rem; color: #94a3b8;">(Pu-238 Half-life Decay Model)</span>
    </div>
    <div style="margin-bottom: 1rem; font-size: 0.9rem; color: #cbd5e1;">
      Active Systems Load: <strong id="load-val" style="color: #f87171;">${systemLoad} W</strong>
    </div>
    <div id="breaker-controls" style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
      <button id="btn-toggle-heater" class="btn-pump" style="background: #334155; font-size: 0.85rem;">❄️ Toggle Planetary Heater (-30W)</button>
      <button id="btn-toggle-science" class="btn-pump" style="background: #334155; font-size: 0.85rem;">🔬 Toggle Plasma Science (-25W)</button>
    </div>
    <button id="btn-lock-beacon" class="btn-pump" style="margin-top: 1rem; background: #2563eb;">📡 LOCK GOLDEN RECORD TRANSMISSION</button>
  `;

  let heaterActive = true;
  let scienceActive = true;

  const updateLoadUI = () => {
    const loadEl = document.getElementById("load-val");
    loadEl.textContent = `${systemLoad} W`;
    loadEl.style.color = systemLoad <= livePower ? "#4ade80" : "#f87171";
  };

  document.getElementById("btn-toggle-heater").onclick = () => {
    playSpaceSfx("pump");
    heaterActive = !heaterActive;
    systemLoad += heaterActive ? 30 : -30;
    updateLoadUI();
    document.getElementById("btn-toggle-heater").style.background = heaterActive ? "#334155" : "#1e293b";
  };

  document.getElementById("btn-toggle-science").onclick = () => {
    playSpaceSfx("pump");
    scienceActive = !scienceActive;
    systemLoad += scienceActive ? 25 : -25;
    updateLoadUI();
    document.getElementById("btn-toggle-science").style.background = scienceActive ? "#334155" : "#1e293b";
  };

  document.getElementById("btn-lock-beacon").onclick = () => {
    if (systemLoad <= livePower) {
      finishMiniGame(
        "Voyager 1 Light Horizon Reached!",
        `Successfully balanced systems at ${systemLoad}W against the decaying ${livePower}W Plutonium RTG limit!`,
        choice.nasaFact || "Voyager 1 relies on its diminishing RTG power source to communicate from over 16 billion miles away."
      );
    } else {
      alert("⚠️ Power overload! System load exceeds available RTG wattage. Turn off auxiliary instruments!");
    }
  };
}

function finishMiniGame(badgeText, outcomeText, nasaFact) {
  playSpaceSfx("win");
  document.getElementById("minigame-box")?.classList.add("hidden");
  const outcomeBox = document.getElementById("outcome-box");
  outcomeBox?.classList.remove("hidden");
  document.getElementById("outcome-title").textContent = badgeText;
  document.getElementById("outcome-text").textContent = outcomeText;
  document.getElementById("outcome-nasa-note").innerHTML = `<strong>🔬 Real NASA Science:</strong> ${nasaFact}`;
}

function advanceStory() {
  const currentScene = STORY_SCENES[state.sceneIdx];
  if (currentScene.unlockPatch) {
    const p = currentScene.unlockPatch;
    if (!state.unlockedPatches.some(item => item.id === p.id)) {
      state.unlockedPatches.push(p);
      state.selectedPatchIcon = p.image;
      updateStatsUI();
    }
    openSuitLocker(p.trivia, goToNextSceneOrFinale);
  } else {
    goToNextSceneOrFinale();
  }
}

function goToNextSceneOrFinale() {
  if (state.sceneIdx < STORY_SCENES.length - 1) {
    state.sceneIdx++;
    renderScene();
  } else {
    const finaleNameEl = document.getElementById("finale-player-name");
    if (finaleNameEl) {
      finaleNameEl.textContent = state.playerName || "Commander Sunny";
    }

    const avgSurvival = Math.round((state.o2 + state.shield + state.health) / 3);
    const patchBonus = state.unlockedPatches.length * 5;
    const totalScore = Math.min(100, avgSurvival + patchBonus);

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl("debrief-rank", `SCORE: ${totalScore}/100`);
    setEl("debrief-o2", `${state.o2}%`);
    setEl("debrief-shield", `${state.shield}%`);
    setEl("debrief-health", `${state.health}%`);
    setEl("debrief-flare", NASA_TELEMETRY.donki.flareClass);
    setEl("debrief-rtg", `${calculateVoyagerPower()}W`);

    document.getElementById("story-screen")?.classList.add("hidden");
    document.getElementById("finale-screen")?.classList.remove("hidden");
  }
}

function updateStatsUI() {
  document.getElementById("stat-o2").textContent = `${state.o2}%`;
  document.getElementById("stat-shield").textContent = `${state.shield}%`;
  document.getElementById("stat-health").textContent = `${state.health}%`;
  document.getElementById("patch-count").textContent = state.unlockedPatches.length;
}

function clamp(val) { return Math.max(0, Math.min(100, val)); }

function openSuitLocker(customMessage, onCloseCallback) {
  state.pendingNextStep = onCloseCallback || null;
  document.getElementById("locker-trivia").textContent = customMessage || "Tap a patch, then click any spot on Sunny's spacesuit!";
  renderLockerPatches();
  renderSuitAppearance();
  document.getElementById("suit-modal")?.classList.remove("hidden");
}

function renderLockerPatches() {
  const listEl = document.getElementById("earned-patches-list");
  listEl.innerHTML = "";
  if (state.unlockedPatches.length === 0) {
    listEl.innerHTML = `<p style="color:#94a3b8; font-size:0.85rem;">No patches yet!</p>`;
    return;
  }
  state.unlockedPatches.forEach(patch => {
    const btn = document.createElement("button");
    const isSelected = state.selectedPatchIcon === patch.image;
    btn.className = `tray-patch-btn ${isSelected ? "selected" : ""}`;
    btn.innerHTML = `
      <img src="${patch.image}" alt="${patch.name}" style="width:38px; height:38px; object-fit:contain; border-radius:6px;" />
      <div><strong>${patch.name}</strong><br/><small style="color:#fbbf24;">${isSelected ? "✓ Selected" : "Click to select"}</small></div>
    `;
    btn.onclick = () => { state.selectedPatchIcon = patch.image; renderLockerPatches(); };
    listEl.appendChild(btn);
  });
}

function renderSuitAppearance() {
  const suitEl = document.getElementById("spacesuit-figure");
  if (suitEl) {
    suitEl.className = `spacesuit ${state.suitColor}`;
    if (state.suitColor === "orange") {
      suitEl.style.backgroundImage = `url("assets/suit-orange.png")`;
      suitEl.style.backgroundSize = "contain";
      suitEl.style.backgroundRepeat = "no-repeat";
      suitEl.style.backgroundPosition = "center";
    } else if (state.suitColor === "white") {
      suitEl.style.backgroundImage = `url("assets/suit-white.png")`;
      suitEl.style.backgroundSize = "contain";
      suitEl.style.backgroundRepeat = "no-repeat";
      suitEl.style.backgroundPosition = "center";
    } else {
      suitEl.style.backgroundImage = "none";
    }
  }

  document.querySelectorAll(".patch-slot").forEach(slotBtn => {
    const slotKey = slotBtn.dataset.slot;
    const placedImg = state.suitSlots[slotKey];
    if (placedImg) {
      slotBtn.innerHTML = `<img src="${placedImg}" style="width:32px; height:32px; object-fit:contain;" />`;
      slotBtn.classList.add("filled");
    } else {
      slotBtn.textContent = "+";
      slotBtn.classList.remove("filled");
    }
  });
}

function updateLiveVoyagerTelemetry() {
  const milestoneUtc = Date.UTC(2026, 10, 18, 10, 16, 7);
  const diffSec = (Date.now() - milestoneUtc) / 1000;
  const currentMiles = 16092000000 + (diffSec * 10.56);
  const lightSeconds = 86400 + (diffSec * (10.56 / 186282));
  const hrs = Math.floor(lightSeconds / 3600);
  const mins = Math.floor((lightSeconds % 3600) / 60);
  const secs = Math.floor(lightSeconds % 60);

  const distEl = document.getElementById("voyager-distance");
  const timeEl = document.getElementById("voyager-light-time");
  if (distEl && timeEl) {
    distEl.textContent = `${Math.round(currentMiles).toLocaleString()} miles`;
    timeEl.textContent = `${hrs}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }
}

async function transmitVGRMorse() {
  const btn = document.getElementById("btn-shine-vgr");
  const display = document.getElementById("morse-display");
  const overlay = document.getElementById("flash-overlay");
  btn.disabled = true;

  const sequence = [
    { letter: "V", sym: "•", dur: 180 }, { letter: "V", sym: "•", dur: 180 }, { letter: "V", sym: "•", dur: 180 }, { letter: "V", sym: "—", dur: 480 },
    { pause: 350 },
    { letter: "G", sym: "—", dur: 480 }, { letter: "G", sym: "—", dur: 480 }, { letter: "G", sym: "•", dur: 180 },
    { pause: 350 },
    { letter: "R", sym: "•", dur: 180 }, { letter: "R", sym: "—", dur: 480 }, { letter: "R", sym: "•", dur: 180 }
  ];

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  for (const step of sequence) {
    if (step.pause) { await sleep(step.pause); continue; }
    display.textContent = `🦉 HOOTING: ${step.letter}  [ ${step.sym} ]`;
    overlay?.classList.add("active");
    playHootBeep(audioCtx, step.dur);
    await sleep(step.dur);
    overlay?.classList.remove("active");
    await sleep(140);
  }
  display.textContent = "✨ V - G - R SIGNAL SENT TO VOYAGER 1! ✨";
  btn.disabled = false;
}

function playHootBeep(ctx, durationMs) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 520;
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000);
}

function playSpaceSfx(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "pump") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === "win") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (e) {}
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function showModal(badge, title, body) {
  document.getElementById("modal-badge").textContent = badge;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").textContent = body;
  document.getElementById("modal-overlay")?.classList.remove("hidden");
}

function bindButtons() {
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };

  bind("btn-start-adventure", startStory);
  bind("btn-next-scene", advanceStory);
  bind("btn-shine-vgr", transmitVGRMorse);
  bind("btn-play-again", startStory);

  bind("btn-suit-locker", () => openSuitLocker(null, null));
  bind("btn-finale-suit", () => openSuitLocker("Fully decorated mission spacesuit!", null));

  bind("btn-close-locker", () => {
    document.getElementById("suit-modal")?.classList.add("hidden");
    if (state.pendingNextStep) {
      const next = state.pendingNextStep;
      state.pendingNextStep = null;
      next();
    }
  });

  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.onclick = () => { state.suitColor = dot.dataset.color; renderSuitAppearance(); };
  });

  document.querySelectorAll(".patch-slot").forEach(slotBtn => {
    slotBtn.onclick = () => {
      const slotKey = slotBtn.dataset.slot;
      if (state.selectedPatchIcon) {
        state.suitSlots[slotKey] = state.selectedPatchIcon;
        renderSuitAppearance();
      } else if (state.suitSlots[slotKey]) {
        state.suitSlots[slotKey] = null;
        renderSuitAppearance();
      }
    };
  });

  bind("btn-how-to", () => {
    showModal("📖", "How to Play", "1. Read Sunny & Hoot's space scenario and make a trade-off choice.\n2. Play the hands-on mini-game (pump water, wipe Mars dust, flip breakers).\n3. Decorate your suit and flash Morse code to Voyager 1!");
  });

  const modalOverlay = document.getElementById("modal-overlay");
  if (modalOverlay) {
    modalOverlay.onclick = (e) => {
      if (e.target.id === "modal-overlay") modalOverlay.classList.add("hidden");
    };
  }
  bind("btn-modal-close", () => document.getElementById("modal-overlay")?.classList.add("hidden"));
  bind("btn-nasa-data", () => document.getElementById("data-modal")?.classList.remove("hidden"));
  bind("btn-close-data", () => document.getElementById("data-modal")?.classList.add("hidden"));
}

// Generate and Download Official PDF Certificate in Browser (using Saatvik's assets/)
// Generate and Download Official PDF Certificate in Browser (using Saatvik's exact template)
// Generate and Download Official PDF Certificate in Browser (using Saatvik's exact template)
async function downloadMissionCertificate() {
  if (!window.jspdf) {
    alert("PDF library is still loading. Please try again in a second!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const btn = document.getElementById("btn-download-cert");
  if (btn) btn.textContent = "⏳ Generating Certificate...";

  const loadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 1100;
  canvas.height = 750;
  const ctx = canvas.getContext("2d");

  // 1. Draw Saatvik's specific certificate template from assets/ based on suit color
  let templateFileName = "assets/cert_template1.png"; // Default White
  if (state.suitColor === "orange") {
    templateFileName = "assets/cert_template2.png"; // Orange Suit Template
  } else if (state.suitColor === "blue") {
    templateFileName = "assets/cert_template3.png"; // Blue Suit Template
  }

  const bgImg = await loadImage(templateFileName);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 2. Draw Player's Name in the Middle Blank Space (Right under "THIS IS TO CERTIFY THAT")
  const playerName = state.playerName || "Commander Sunny";
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 46px sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 8;
  ctx.fillText(playerName, canvas.width / 2, 425);
  ctx.shadowBlur = 0; // Reset shadow

  // 3. Place Earned Mission Patches neatly inside the White Circle on the Left
  const patchFiles = ["assets/patch-artemis.png", "assets/patch-mars.png", "assets/patch-voyager.png"];
  const unlocked = state.unlockedPatches.length > 0 ? state.unlockedPatches : [];

  // If patches are earned, display them right in the white circle slot (X: 140, Y: 430)
  if (unlocked.length > 0) {
    // Show the most recently earned patch or cycle them
    const latestPatch = patchFiles[Math.min(unlocked.length - 1, patchFiles.length - 1)];
    const patchImg = await loadImage(latestPatch);
    if (patchImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(140, 430, 68, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(patchImg, 72, 362, 136, 136);
      ctx.restore();
    }
  }

  // 4. Export Canvas to Landscape PDF and Trigger Download
  const imgData = canvas.toDataURL("image/png");
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height]
  });

  doc.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  doc.save("Curious_Cosmo_Mission_Certificate.pdf");

  if (btn) btn.textContent = "🏅 Download Official Mission Certificate (PDF)";
}

initGame();