import { logger } from './logger';
import { normalizePath } from './mk';

export const dynamicImport = (path: string) => {
  try {
    return eval(`import('${normalizePath(path)}');`);
  } catch (e) {
    logger.info(e);
    logger.error('Error in dynamicImport() function');
  }
};
