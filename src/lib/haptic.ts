export function triggerHaptic() {
    if (typeof window !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate(15);
        } catch (e) {
            // Ignore errors (some browsers/devices restrict this)
        }
    }
}
