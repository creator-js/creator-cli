import path from 'path';
import { fileURLToPath } from 'url';

import { dynamicImport } from './dynamicImport';
import { logger } from './logger';
import { fileExists } from './mk';

import { IConfig } from '../types/config.types';

const defaultConfig: IConfig = {
  variables: {
    root: './'
  },
  domains: []
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function readJSON(): Promise<IConfig> {
  try {
    const file = path.resolve(__dirname, './creator.config.js');
    logger.info(`Reading file ${file}`);
    const GJSONExists = fileExists(file);

    if (!GJSONExists) {
      logger.info('creator.config.js not found. Using default config.');
      return defaultConfig;
    }

    const json = (await dynamicImport(file)).default;

    if (!json) {
      return defaultConfig;
    }

    const result: IConfig = {
      ...defaultConfig,
      ...json
    };

    return result;
  } catch (e) {
    logger.info(e);
    logger.error('Error in readJSON() function. Using default config.');
    return defaultConfig;
  }
}
