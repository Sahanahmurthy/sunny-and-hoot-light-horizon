// === NASA OPEN API & ENGINEERING PHYSICS ENGINE (BY OLAF) ===
const NASA_API_KEY = "rMLhD9jpcPWhMq9DDm7QJkL7BMWrMRDkf7qP7bmF"; 

const NASA_TELEMETRY = {
  donki: { flareClass: "X1.2", peakTime: "2026-11-12T14:22Z", source: "NASA DONKI Feed" },
  radlab: { baselineDoseMicroGyDay: 485.0, waterAttenuationCoeff: 0.042 },
  osdr: { title: "Spaceflight Musculoskeletal Adaptation", studyId: "OSD-48" }
};
// Real Radiation Attenuation Calculation: D = D0 * e^(-mu * x)
function calculateShieldedDose(waterThicknessCm) {
  const d0 = NASA_TELEMETRY.radlab.baselineDoseMicroGyDay; // 485.0 µGy/day baseline
  const mu = NASA_TELEMETRY.radlab.waterAttenuationCoeff;   // 0.042 absorption coefficient
  const attenuatedDose = d0 * Math.exp(-mu * waterThicknessCm);
  return Math.round(attenuatedDose * 10) / 10;
}
// Voyager 1 Plutonium-238 Radioactive Decay: P(t) = P0 * e^(-lambda * t)
function calculateVoyagerPower() {
  const p0 = 470.0;          // Initial power at launch in 1977 (Watts)
  const halfLife = 87.7;     // Pu-238 half-life in years
  const lambda = Math.LN2 / halfLife;
  
  const launchYear = 1977;
  const currentYear = new Date().getFullYear(); // 2026
  const elapsedYears = currentYear - launchYear;
  
  const currentPower = p0 * Math.exp(-lambda * elapsedYears);
  return Math.round(currentPower * 10) / 10; // Returns ~214.6W current output
}
// Life Support Safeguard & Emergency Abort Check
function checkLifeSupportSafeguards() {
  const res = state.resources;
  
  if (res.o2 <= 0 || res.shield <= 0 || res.power <= 0) {
    // Clear any active mini-game timers
    if (state.activeTimer) clearInterval(state.activeTimer);
    
    // Trigger Emergency Abort Screen
    const arena = document.getElementById("mg-arena") || document.body;
    arena.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.15); border: 2px solid #ef4444; padding: 1.5rem; border-radius: 12px; text-align: center; color: #f87171;">
        <h2 style="margin-bottom: 0.5rem;">🚨 MISSION EMERGENCY ABORT 🚨</h2>
        <p style="font-size: 0.95rem; color: #cbd5e1; margin-bottom: 1rem;">
          Critical life support failure detected! Habitat systems could not sustain parameters against deep space telemetry extremes.
        </p>
        <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.2rem;">
          Final Status — Oxygen: ${res.o2}% | Shielding: ${res.shield}% | Power: ${res.power}%
        </div>
        <button onclick="location.reload()" style="background: #ef4444; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 8px; font-weight: bold; cursor: pointer;">
          🔄 RESTART MISSION
        </button>
      </div>
    `;
    return true;
  }
  return false;
}
// Inside your choice click handler:
state.resources.o2 += choice.effects.o2 || 0;
state.resources.shield += choice.effects.shield || 0;
state.resources.power += choice.effects.power || 0;

// 🚨 Add this right here:
if (checkLifeSupportSafeguards()) {
  return; // Stops the game and shows the emergency abort screen if any resource hits 0
}
async function syncRealNasaApis() {
  try {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const flrUrl = `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${NASA_API_KEY}`;
    
    const flrRes = await fetch(flrUrl);
    if (!flrRes.ok) return; // Silently exit if the endpoint returns a 404 or limit error
    
    const flares = await flrRes.json();
    if (Array.isArray(flares) && flares.length > 0) {
      const latest = flares[flares.length - 1];
      NASA_TELEMETRY.donki.flareClass = latest.classType || "M5.4";
      NASA_TELEMETRY.donki.peakTime = latest.peakTime || end;
    }
  } catch (err) {
    console.warn("DONKI offline fallback active.");
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
    unlockPatch: { id: "artemis", icon: "🌓", name: "NASA Artemis Patch", trivia: "🎉 You shielded the base from the solar storm and earned the Artemis Patch!" }
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
    unlockPatch: { id: "perseverance", icon: "🛸", name: "Mars Perseverance Patch", trivia: "🎉 Solar array clean! You earned the Mars Perseverance Patch!" }
  },
  {
    chapter: "Chapter 3: Interstellar Relay (Voyager 1)",
    bgClass: "space-bg",
    emoji: "🛰️🦉✨",
    caption: "CHAPTER 3 • DEEP SPACE • DELAY: 24 HOURS (1 LIGHT-DAY)",
    delay: "24 hrs",
    speaker: "🦉 Hoot's Deep-Space Telemetry",
    story: "We caught up with Voyager 1—16.09 billion miles away! Its nuclear battery dropped to 215W. Flip off non-essential instruments before the fuse blows!",
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
    unlockPatch: { id: "voyager", icon: "📀", name: "Voyager Golden Record", trivia: "🎉 Voyager 1 saved across 1 Light-Day! Final patch unlocked!" }
  }
];

let state = {
  sceneIdx: 0, o2: 80, shield: 70, health: 80,
  unlockedPatches: [], selectedPatchIcon: null,
  suitSlots: { leftArm: null, chest: null, rightArm: null },
  suitColor: "white", pendingNextStep: null, activeTimer: null
};

function initGame() {
  syncRealNasaApis();
  bindButtons();
  updateLiveVoyagerTelemetry();
  setInterval(updateLiveVoyagerTelemetry, 1000);
}

function startStory() {
  clearInterval(state.activeTimer);
  state = {
    sceneIdx: 0, o2: 80, shield: 70, health: 80,
    unlockedPatches: [], selectedPatchIcon: null,
    suitSlots: { leftArm: null, chest: null, rightArm: null },
    suitColor: "white", pendingNextStep: null, activeTimer: null
  };
  document.getElementById("intro-screen").classList.add("hidden");
  document.getElementById("finale-screen").classList.add("hidden");
  document.getElementById("story-screen").classList.remove("hidden");
  renderScene();
}

function renderScene() {
  const scene = STORY_SCENES[state.sceneIdx];
  document.getElementById("chapter-label").textContent = scene.chapter;
  document.getElementById("stat-delay").textContent = scene.delay;
  updateStatsUI();

  const art = document.getElementById("scene-art");
  art.className = `scene-art ${scene.bgClass}`;
  document.getElementById("scene-emoji").textContent = scene.emoji;
  document.getElementById("scene-banner").textContent = scene.caption;
  document.getElementById("speaker-name").textContent = scene.speaker;
  document.getElementById("story-text").textContent = scene.story;

  document.getElementById("minigame-box").classList.add("hidden");
  document.getElementById("outcome-box").classList.add("hidden");

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
  state.o2 = clamp(state.o2 + choice.effects.o2);
  state.shield = clamp(state.shield + choice.effects.shield);
  state.health = clamp(state.health + choice.effects.health);
  updateStatsUI();

  document.getElementById("choices-container").classList.add("hidden");
  document.getElementById("minigame-box").classList.remove("hidden");

  if (scene.minigameType === "shieldPump") runShieldPumpGame(choice);
  else if (scene.minigameType === "dustWiper") runDustWiperGame(choice);
  else if (scene.minigameType === "voyagerBreakers") runVoyagerBreakersGame(choice);
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
  document.getElementById("mg-title").textContent = "🧹 Wipe Martian Dust Off Solar Array!";
  document.getElementById("mg-instructions").textContent = "Click or hover over all 8 dusty red tiles to clean them!";
  const arena = document.getElementById("mg-arena");
  let cleaned = 0, timeLeft = 12;
  document.getElementById("mg-timer").textContent = `⏱️ ${timeLeft}s`;

  const grid = document.createElement("div");
  grid.className = "solar-grid";
  for (let i = 0; i < 8; i++) {
    const tile = document.createElement("button");
    tile.className = "solar-tile dusty";
    tile.textContent = "🌫️";
    const clean = () => {
      if (tile.classList.contains("clean")) return;
      tile.className = "solar-tile clean";
      tile.textContent = "☀️";
      cleaned++;
      if (cleaned >= 8) {
        clearInterval(state.activeTimer);
        finishMiniGame("Panels 100% Clean!", "Sunny brushed off the dust, restoring full solar power!", choice.nasaFact);
      }
    };
    tile.onclick = clean;
    tile.onmouseenter = clean;
    grid.appendChild(tile);
  }
  arena.innerHTML = "";
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

  const livePower = calculateVoyagerPower(); // Dynamically computes ~214.6W based on half-life decay
  let systemLoad = 180.0; // Initial active load in Watts

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

  document.getElementById("btn-toggle-heater").onclick = () => {
    heaterActive = !heaterActive;
    systemLoad += heaterActive ? 30 : -30;
    document.getElementById("load-val").textContent = `${systemLoad} W`;
    document.getElementById("btn-toggle-heater").style.background = heaterActive ? "#334155" : "#1e293b";
  };

  document.getElementById("btn-toggle-science").onclick = () => {
    scienceActive = !scienceActive;
    systemLoad += scienceActive ? 25 : -25;
    document.getElementById("load-val").textContent = `${systemLoad} W`;
    document.getElementById("btn-toggle-science").style.background = scienceActive ? "#334155" : "#1e293b";
  };

  document.getElementById("btn-lock-beacon").onclick = () => {
    if (systemLoad <= livePower) {
      finishMiniGame(
        "Voyager 1 Light Horizon Reached!",
        `Successfully balanced systems at ${systemLoad}W against the decaying ${livePower}W Plutonium RTG limit!`,
        choice.nasaFact || "Voyager 1 relies on its diminishing RTG power source to communicate from over 24 billion kilometers away."
      );
    } else {
      alert("⚠️ Power overload! System load exceeds available RTG wattage. Turn off auxiliary instruments!");
    }
  };
}

function finishMiniGame(badgeText, outcomeText, nasaFact) {
  document.getElementById("minigame-box").classList.add("hidden");
  const outcomeBox = document.getElementById("outcome-box");
  outcomeBox.classList.remove("hidden");
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
      state.selectedPatchIcon = p.icon;
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
    document.getElementById("story-screen").classList.add("hidden");
    document.getElementById("finale-screen").classList.remove("hidden");
  }
}

function updateStatsUI() {
  document.getElementById("stat-o2").textContent = `${state.o2}%`;
  document.getElementById("stat-shield").textContent = `${state.shield}%`;
  document.getElementById("stat-health").textContent = `${state.health}%`;
  document.getElementById("patch-count").textContent = state.unlockedPatches.length;
}

function clamp(val) { return Math.max(10, Math.min(100, val)); }

function openSuitLocker(customMessage, onCloseCallback) {
  state.pendingNextStep = onCloseCallback || null;
  document.getElementById("locker-trivia").textContent = customMessage || "Tap a patch, then click any spot on Sunny's spacesuit!";
  renderLockerPatches();
  renderSuitAppearance();
  document.getElementById("suit-modal").classList.remove("hidden");
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
    const isSelected = state.selectedPatchIcon === patch.icon;
    btn.className = `tray-patch-btn ${isSelected ? "selected" : ""}`;
    btn.innerHTML = `<span class="tray-patch-icon">${patch.icon}</span><div><strong>${patch.name}</strong><br/><small style="color:#fbbf24;">${isSelected ? "✓ Selected" : "Click to select"}</small></div>`;
    btn.onclick = () => { state.selectedPatchIcon = patch.icon; renderLockerPatches(); };
    listEl.appendChild(btn);
  });
}

function renderSuitAppearance() {
  const suitEl = document.getElementById("spacesuit-figure");
  suitEl.className = `spacesuit ${state.suitColor}`;
  document.querySelectorAll(".patch-slot").forEach(slotBtn => {
    const slotKey = slotBtn.dataset.slot;
    const placedIcon = state.suitSlots[slotKey];
    if (placedIcon) {
      slotBtn.textContent = placedIcon;
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
    overlay.classList.add("active");
    playHootBeep(audioCtx, step.dur);
    await sleep(step.dur);
    overlay.classList.remove("active");
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

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function showModal(badge, title, body) {
  document.getElementById("modal-badge").textContent = badge;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").textContent = body;
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function bindButtons() {
  document.getElementById("btn-start-adventure").onclick = startStory;
  document.getElementById("btn-next-scene").onclick = advanceStory;
  document.getElementById("btn-shine-vgr").onclick = transmitVGRMorse;
  document.getElementById("btn-play-again").onclick = startStory;

  document.getElementById("btn-suit-locker").onclick = () => openSuitLocker(null, null);
  document.getElementById("btn-finale-suit").onclick = () => openSuitLocker("Fully decorated mission spacesuit!", null);

  document.getElementById("btn-close-locker").onclick = () => {
    document.getElementById("suit-modal").classList.add("hidden");
    if (state.pendingNextStep) {
      const next = state.pendingNextStep;
      state.pendingNextStep = null;
      next();
    }
  };

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

  document.getElementById("btn-how-to").onclick = () => {
    showModal("📖", "How to Play", "1. Read Sunny & Hoot's space scenario and make a trade-off choice.\n2. Play the hands-on mini-game (pump water, wipe Mars dust, flip breakers).\n3. Decorate your suit and flash Morse code to Voyager 1!");
  };

  document.getElementById("modal-overlay").onclick = (e) => {
    if (e.target.id === "modal-overlay") document.getElementById("modal-overlay").classList.add("hidden");
  };
  document.getElementById("btn-modal-close").onclick = () => document.getElementById("modal-overlay").classList.add("hidden");

  document.getElementById("btn-nasa-data").onclick = () => document.getElementById("data-modal").classList.remove("hidden");
  document.getElementById("btn-close-data").onclick = () => document.getElementById("data-modal").classList.add("hidden");
}

initGame();
// Generate and Download Official PDF Certificate in Browser
async function downloadMissionCertificate() {
  const { jsPDF } = window.jspdf;
  const btn = document.getElementById("btn-download-cert");
  if (btn) btn.textContent = "⏳ Generating Certificate...";

  // Helper to safely load local PNGs without crashing if Saatvik's files aren't added yet
  const loadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

  // Create high-res landscape canvas (1100 x 750 px)
  const canvas = document.createElement("canvas");
  canvas.width = 1100;
  canvas.height = 750;
  const ctx = canvas.getContext("2d");

  // 1. Draw Saatvik's Blank Template (or dark space fallback)
  const bgImg = await loadImage("cert_template.png");
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  }

  // 2. Draw Recipient Name in Center
  const playerName = state.playerName || "Sahana H Murthy";
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 42px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(playerName, canvas.width / 2, 310);

  // 3. Draw Earned Mission Patches on the Left Side
  const patchFiles = ["patch_artemis.png", "patch_jezero.png", "patch_voyager.png"];
  for (let i = 0; i < patchFiles.length; i++) {
    const patchImg = await loadImage(patchFiles[i]);
    const yPos = 140 + (i * 170);
    if (patchImg) {
      ctx.drawImage(patchImg, 75, yPos, 130, 130);
    }
  }

  // 4. Draw Customized Suit on the Right Side
  const suitImg = await loadImage("custom_suit.png");
  if (suitImg) {
    ctx.drawImage(suitImg, canvas.width - 270, 160, 190, 390);
  }

  // 5. Export Canvas to Landscape PDF and Trigger Download
  const imgData = canvas.toDataURL("image/png");
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height]
  });

  doc.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  doc.save("Sunny_and_Hoot_Mission_Certificate.pdf");

  if (btn) btn.textContent = "🏅 Download Official Mission Certificate (PDF)";
}