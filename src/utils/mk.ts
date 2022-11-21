import * as fs from 'fs';

import { logger } from './logger';

import { AnyFunction } from '../types/common.types';

export const mkDir = (filePath: string) => {
  try {
    const normalizedPath = normalizePath(filePath);
    const pathArr = normalizedPath.split('/').filter((s: string) => s !== '' && s !== '.');
    let p = '.';

    while (pathArr.length > 0) {
      const folder = pathArr.shift();
      p += `/${folder}`;

      if (!fs.existsSync(p)) {
        fs.mkdirSync(p);

      }
    }
  } catch (e) {
    logger.info(e);
    logger.error('Error in mkDir() function');
  }
};

export const mkFile = (filePath: string, data: string, onCreate?: AnyFunction) => {
  try {
    const normalizedPath = normalizePath(filePath);

    if (!fs.existsSync(normalizedPath)) {
      const tmp = normalizedPath.split('/');
      const lastSlash = tmp.lastIndexOf('/');
      const pathToFile = tmp.slice(0, lastSlash).join('/');
      mkDir(pathToFile);

      fs.appendFileSync(normalizedPath, data);
      onCreate && onCreate();
    } else {
      logger.info(`File already exists ${normalizedPath}`);
    }
  } catch (e) {
    logger.info(e);
    logger.error('Error in mkFile() function');
  }
};

export const fileExists = (filePath: string) => {
  try {
    const normalizedPath = normalizePath(filePath);
    return fs.existsSync(normalizedPath);
  } catch (e) {
    logger.info(e);
    logger.error('Error in fileExists() function');
  }
};

export const normalizePath = (filePath: string): string => {
  return filePath.replace(/\\/g, '/');
};
