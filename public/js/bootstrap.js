import { CONFIG, MOCK_MODE } from './config.js';
import { setDatasourceImplementation } from './api/datasource.contract.js';

async function init() {
  try {
    if (MOCK_MODE) {
      const module = await import('./api/datasource.placeholder.js');
      setDatasourceImplementation(module.placeholderDatasource);
      console.info('Running in MOCK_MODE. Placeholder datasource active.');
    } else {
      console.warn('MOCK_MODE disabled but Supabase implementation is not wired yet.');
    }
  } catch (error) {
    console.error('Failed to bootstrap datasource', error);
  }

  window.APP_FLAGS = Object.freeze({
    ...window.APP_FLAGS,
    MOCK_MODE,
    CONFIG
  });
}

init();