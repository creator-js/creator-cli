import { fixFile } from './fixFile';

import { AnyFunction } from '../types/common.types';
import { logger } from '../utils/logger';
import { mkFile } from '../utils/mk';

export const createFile = (filePath: string, content: string, onComplete?: AnyFunction) => {
  try {

    const fixedLines = fixFile(content);
    const fixedContent = fixedLines.join('\n').trim();

    if (fixedContent === '') {
      return;
    }

    mkFile(filePath, fixedContent, () => {
      onComplete && onComplete();
    });
  } catch (e) {
    logger.info(e);
    logger.error('Error in createFile() function');
  }
};
