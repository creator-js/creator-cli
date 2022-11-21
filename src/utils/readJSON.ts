import * as path from 'path';

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

export async function readJSON(): Promise<IConfig> {

  const file = path.resolve('./creator.config.js');
  logger.info(`Reading file ${file}`);
  const GJSONExists = fileExists(file);

  if (!GJSONExists) {
    logger.info('g.js not found. Using default config.');
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
}
