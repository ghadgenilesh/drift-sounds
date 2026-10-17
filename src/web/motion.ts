export async function enableWebMotion(): Promise<string> {
  if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return 'Tilt is unavailable on this device';
  try {
    const constructor = DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<string> };
    if (constructor.requestPermission && await constructor.requestPermission() !== 'granted') return 'Tilt permission was declined';
    window.dispatchEvent(new Event('night-motion-enabled'));
    return 'Tilt effects enabled';
  } catch { return 'Tilt is unavailable in this browser'; }
}
