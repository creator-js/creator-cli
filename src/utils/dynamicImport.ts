import { logger } from './logger';
import { normalizePath } from './mk';

export const dynamicImport = async (path: string) => {
  try {
    const winPrefix = process.platform === 'win32' ? 'file://' : '';
    return await import(`${winPrefix}${normalizePath(path)}`);
  } catch (e) {
    logger.info(e);
    logger.error('Error in dynamicImport() function');
    throw e;
  }
};
