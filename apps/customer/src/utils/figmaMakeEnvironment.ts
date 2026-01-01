// Minimal shim to provide environment variables when running locally.
// This mirrors the expected shape used by `envConfig.ts`.

export function getFigmaMakeVariable(key: string): string | undefined {
  if (typeof window !== 'undefined' && (window.__ENV_CONFIG__?.[key])) {
    return window.__ENV_CONFIG__[key];
  }

  if (typeof process !== 'undefined' && (process.env as any)[key]) {
    return (process.env as any)[key];
  }

  return undefined;
}

export function getGoogleMapsKeyWithFallback(): string | null {
  const val = getFigmaMakeVariable('GOOGLE_MAPS_API_KEY');
  return val && val !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? val : null;
}
