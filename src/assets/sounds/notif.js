// Web Audio API lightweight Notification Sound Generator
// Respects browser autoplay restrictions by managing a persistent AudioContext

let sharedCtx = null;

const initAudio = () => {
    if (sharedCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    sharedCtx = new AudioContext();
};

// Any click anywhere on the page will resume the AudioContext, allowing background sounds
const unlockAudio = () => {
    if (sharedCtx && sharedCtx.state === 'suspended') {
        sharedCtx.resume();
    }
};

// Attach early to catch the first user interaction
if (typeof window !== 'undefined') {
    window.addEventListener('click', () => {
        initAudio();
        unlockAudio();
    }, { once: true });
}

export const playNotificationSound = () => {
    try {
        if (!sharedCtx) {
            initAudio();
        }

        if (!sharedCtx || sharedCtx.state === 'suspended') {
            console.warn("Audio playback blocked by browser. User must click the page first.");
            return;
        }

        const osc = sharedCtx.createOscillator();
        const gain = sharedCtx.createGain();

        osc.connect(gain);
        gain.connect(sharedCtx.destination);

        // Pleasant double-chime setup (Ting-Ting!)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, sharedCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, sharedCtx.currentTime + 0.1); // A6 slide

        gain.gain.setValueAtTime(0, sharedCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, sharedCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, sharedCtx.currentTime + 0.3);

        osc.start(sharedCtx.currentTime);
        osc.stop(sharedCtx.currentTime + 0.3);
    } catch (e) {
        console.warn("Audio generation failed:", e);
    }
};
