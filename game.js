// === NASA OPEN API & ENGINEERING PHYSICS ENGINE (BY OLAF) ===
const NASA_API_KEY = "DEMO_KEY"; 

const NASA_TELEMETRY = {
  donki: { flareClass: "X1.2", peakTime: "2026-11-12T14:22Z", source: "NASA DONKI Feed" },
  radlab: { baselineDoseMicroGyDay: 485.0, waterAttenuationCoeff: 0.042 },
  osdr: { title: "Spaceflight Musculoskeletal Adaptation", studyId: "OSD-48" }
};

async function syncRealNasaApis() {
  try {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const flrUrl = `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${NASA_API_KEY}`;
    const flrRes = await fetch(flrUrl);
    if (flrRes.ok) {
      const flares = await flrRes.json();
      if (Array.isArray(flares) && flares.length > 0) {
        const latest = flares[flares.length - 1];
        NASA_TELEMETRY.donki.flareClass = latest.classType || "M5.4";
        NASA_TELEMETRY.donki.peakTime = latest.peakTime || end;
      }
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
  document.getElementById("mg-instructions").textContent = "Rapidly tap the button below to fill the Water Shield to 100% before the flare hits!";
  const arena = document.getElementById("mg-arena");
  let fill = 15, timeLeft = 10;
  document.getElementById("mg-timer").textContent = `⏱️ ${timeLeft}s`;

  arena.innerHTML = `
    <div class="pump-meter-bg"><div id="pump-fill" class="pump-meter-fill" style="width: 15%">15%</div></div>
    <button id="btn-pump-water" class="btn-pump">💧 PUMP WATER! (TAP FAST!)</button>
  `;

  document.getElementById("btn-pump-water").onclick = () => {
    fill = Math.min(100, fill + (choice.pumpBoost || 12));
    document.getElementById("pump-fill").style.width = `${fill}%`;
    document.getElementById("pump-fill").textContent = `${fill}%`;
    if (fill >= 100) {
      clearInterval(state.activeTimer);
      finishMiniGame("Solar Storm Blocked at 100%!", "You pumped water into the walls just in time—safe inside the blue water shield!", choice.nasaFact);
    }
  };

  state.activeTimer = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("mg-timer").textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(state.activeTimer);
      finishMiniGame("Solar Flare Passed!", `Charged water walls to ${fill}%. Good job!`, choice.nasaFact);
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

function runVoyagerBreakersGame(choice) {
  document.getElementById("mg-title").textContent = "🔌 Shed Power Load to ≤ 215W!";
  document.getElementById("mg-instructions").textContent = "Click 3 extra instruments to switch them OFF (keep Heater & Dish ON!).";
  const arena = document.getElementById("mg-arena");
  let timeLeft = 15;
  document.getElementById("mg-timer").textContent = `⏱️ ${timeLeft}s`;

  const systems = [
    { name: "🔥 Hydrazine Heater", watts: 95, critical: true, on: true },
    { name: "📡 Main Earth Dish", watts: 110, critical: true, on: true },
    { name: "📷 Wide-Angle Camera", watts: 40, critical: false, on: true },
    { name: "🧲 Plasma Wave Sensor", watts: 35, critical: false, on: true },
    { name: "☄️ Cosmic Ray Detector", watts: 30, critical: false, on: true }
  ];

  function renderBreakers() {
    const totalWatts = systems.reduce((sum, s) => sum + (s.on ? s.watts : 0), 0);
    const isSafe = totalWatts <= 215;
    arena.innerHTML = `
      <div class="watt-banner ${isSafe ? "safe" : "overload"}">RTG POWER LOAD: ${totalWatts}W / 215W MAX ${isSafe ? "✅ SAFE!" : "⚠️ OVERLOAD!"}</div>
      <div class="breaker-list" id="breaker-list"></div>
    `;
    const list = document.getElementById("breaker-list");
    systems.forEach((sys, idx) => {
      const btn = document.createElement("button");
      if (sys.critical) {
        btn.className = "breaker-btn critical";
        btn.innerHTML = `<span>${sys.name} (${sys.watts}W)</span><strong>LOCKED</strong>`;
      } else {
        btn.className = `breaker-btn ${sys.on ? "on" : "off"}`;
        btn.innerHTML = `<span>${sys.name} (${sys.watts}W)</span><strong>${sys.on ? "ON" : "OFF"}</strong>`;
        btn.onclick = () => { systems[idx].on = !systems[idx].on; renderBreakers(); };
      }
      list.appendChild(btn);
    });

    if (isSafe) {
      clearInterval(state.activeTimer);
      setTimeout(() => finishMiniGame("Power Balanced at 205W!", "Non-essential instruments shut down. Voyager telemetry secured!", choice.nasaFact), 450);
    }
  }

  renderBreakers();
  state.activeTimer = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("mg-timer").textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(state.activeTimer);
      finishMiniGame("Auto-Safe Mode Engaged!", "Voyager transmitter locked onto Earth.", choice.nasaFact);
    }
  }, 1000);
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