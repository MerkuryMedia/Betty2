import { env as exampleEnv } from './env.example.js';

let localEnv = {};
try {
  const localModule = await import('./env.local.js');
  if (localModule && typeof localModule.env === 'object') {
    localEnv = localModule.env;
  }
} catch (error) {
  console.info('env.local.js not found; using example placeholders.');
}

export const env = Object.freeze({
  ...exampleEnv,
  ...localEnv
});

const hasPlaceholder = Object.values(env).some((value) => {
  return typeof value === 'string' && value.startsWith('__SUPABASE_');
});

export const MOCK_MODE = hasPlaceholder;

export const CONFIG = Object.freeze({
  projectName: 'Betty2 Casino Demo',
  mockLatencyMs: 350,
  mockTickIntervalMs: 3000
});

if (!window.APP_FLAGS) {
  window.APP_FLAGS = {};
}

window.APP_FLAGS.MOCK_MODE = MOCK_MODE;
