import path from 'path';

import { dynamicImport } from './dynamicImport';
import { logger } from './logger';
import { fileExists } from './mk';

import { validateJSON } from './validateJSON';

import { IConfig } from '../types/config.types';

const defaultConfig: IConfig = {
  variables: {
    root: './',
    createEmpty: true
  },
  domains: []
};

export async function readJSON(): Promise<IConfig> {
  try {
    const fileJS = path.resolve('./creator.config.js');
    const fileMJS = path.resolve('./creator.config.mjs');

    let file: string | undefined = undefined;

    if (fileExists(fileJS)) {
      file = fileJS;
    } else if (fileExists(fileMJS)) {
      file = fileMJS;
    }

    logger.info(`Reading file ${file}`);

    if (file === '' || !fileExists(file as string)) {
      logger.info('creator.config.js not found. Using default config.');
      return defaultConfig;
    }

    const json = (await dynamicImport(file as string)).default;

    if (!json) {
      return defaultConfig;
    }

    const isValidConfig = validateJSON(json);

    if (!isValidConfig) {
      logger.error('Invalid config. Using default config.');
      process.exit(0);
      return defaultConfig;
    }

    const result: IConfig = {
      ...defaultConfig,
      ...json,
      variables: {
        ...defaultConfig.variables,
        ...json.variables
      }
    };

    return result;
  } catch (e) {
    logger.info(e);
    logger.error('Error in readJSON() function. Using default config.');
    return defaultConfig;
  }
}
