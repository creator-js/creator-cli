import { logger } from './logger';

export const dynamicImport = (path: string) => {
  try {
    path = path.split('\\').join('/');
    return eval(`import('${path}');`);
  } catch (e) {
    logger.info(e);
    logger.error('Error in dynamicImport() function');
  }
};
