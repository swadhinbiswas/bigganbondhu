// Sound effect utility for the atom builder

// Base sound frequencies for each particle type
const SOUND_CONFIG = {
  proton: {
    frequency: 261.63, // C4
    duration: 200,
    type: "sine",
  },
  neutron: {
    frequency: 293.66, // D4
    duration: 150,
    type: "triangle",
  },
  electron: {
    frequency: 349.23, // F4
    duration: 100,
    type: "sine",
  },
  reset: {
    frequency: 196.0, // G3
    duration: 300,
    type: "sawtooth",
  },
  error: {
    frequency: 185.0, // F#3 -> F#3 -> F#3
    duration: 100,
    type: "sawtooth",
  },
};

// Cache for AudioContext to avoid creating too many
let audioContext: AudioContext | null = null;

/**
 * Play a sound effect for a specific particle action
 */
export const playParticleSound = (
  particleType: "proton" | "neutron" | "electron" | "reset" | "error",
  action: "add" | "remove" | "drop" = "add"
) => {
  // Check if browser supports Web Audio API
  if (typeof window === "undefined" || !window.AudioContext) return;

  // Create AudioContext if it doesn't exist
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  // Get the base configuration for this particle
  const config = SOUND_CONFIG[particleType];

  // Adjust frequency based on action
  let frequency = config.frequency;
  if (action === "remove") {
    frequency = config.frequency * 0.75; // Lower pitch for removal
  } else if (action === "drop") {
    frequency = config.frequency * 1.25; // Higher pitch for dropping
  }

  // Create oscillator
  const oscillator = audioContext.createOscillator();
  oscillator.type = config.type as OscillatorType;
  oscillator.frequency.value = frequency;

  // Create gain node for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.2; // Keep volume low

  // Error sound plays 3 quick beeps
  if (particleType === "error") {
    playErrorSound(audioContext);
    return;
  }

  // Connect and start
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Envelope for a nicer sound
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + config.duration / 1000
  );

  oscillator.start();
  oscillator.stop(audioContext.currentTime + config.duration / 1000);
};

/**
 * Play special error sound (three quick beeps)
 */
const playErrorSound = (context: AudioContext) => {
  const config = SOUND_CONFIG.error;

  for (let i = 0; i < 3; i++) {
    const oscillator = context.createOscillator();
    oscillator.type = config.type as OscillatorType;
    oscillator.frequency.value = config.frequency;

    const gainNode = context.createGain();
    gainNode.gain.value = 0.15;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const startTime = context.currentTime + i * 0.15;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.1);
  }
};

/**
 * Toggle sound on/off
 */
export const toggleSound = (enable: boolean) => {
  localStorage.setItem("atomBuilderSoundEnabled", enable ? "true" : "false");
};

/**
 * Check if sound is enabled
 */
export const isSoundEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("atomBuilderSoundEnabled") !== "false"; // Enabled by default
};
