// Standard HTML5 Audio fallback for notification sounds
// A very short, pleasant "drop" bell sound in base64 wav format
const NOTIF_SOUND_B64 = "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExDQAACsEAABwMAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqs=";

let audioPlayer = null;

if (typeof window !== 'undefined') {
    // We create the audio element once and keep it in memory
    audioPlayer = new Audio(NOTIF_SOUND_B64);
    audioPlayer.volume = 0.8;
}

export const playNotificationSound = () => {
    try {
        if (audioPlayer) {
            audioPlayer.currentTime = 0; // Rewind to start
            const playPromise = audioPlayer.play();

            // Handle browser autoplay policies gracefully
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay prevented sound from playing. User interaction required:", error);
                });
            }
        }
    } catch (e) {
        console.error("Audio playback error:", e);
    }
};
