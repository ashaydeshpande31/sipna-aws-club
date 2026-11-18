// Tiny phone vibration on taps (Android; iPhones ignore it). Safe everywhere.
export const haptic = (pattern = 12) => {
  try {
    if (navigator.vibrate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate(pattern)
  } catch {
    /* ignore */
  }
}
