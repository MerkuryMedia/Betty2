export function ema(previous, value, smoothing = 0.35) {
  if (typeof previous !== 'number' || Number.isNaN(previous)) {
    return value;
  }
  return previous + smoothing * (value - previous);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function randomAround(base, variance = 5) {
  const offset = (Math.random() * 2 - 1) * variance;
  return base + offset;
}