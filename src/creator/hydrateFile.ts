import * as fs from 'fs';

import { fixFile } from './fixFile';

import type { AnyFunction } from '../types/common.types';
import { logger } from '../utils/logger';

export const hydrateFile = (filePath: string, content: string, onComplete?: AnyFunction) => {
  try {
    const fixedLines = fixFile(content);
    const fixedContent = fixedLines.join('\n').trim();

    fs.writeFile(filePath, fixedContent, (e) => {
      if (e) {
        logger.info(e);
        logger.error('Error in hydrateFile() function');
        return;
      }

      onComplete && onComplete();
    });
  } catch (e) {
    logger.info(e);
    logger.error('Error in hydrateFile() function');
  }
};
