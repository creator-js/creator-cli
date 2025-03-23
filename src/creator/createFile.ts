import { fixFile } from './fixFile';

import { logger } from '../utils/logger';
import { mkFile } from '../utils/mk';
import type { AnyFunction } from '../types/common.types';
import type { IConfigTemplate } from '../types/config.types';
import type { IAnswersBase } from '../types/types';

export const createFile = (filePath: string, content: string, allAnswers: IAnswersBase, templateConfig: IConfigTemplate, onComplete?: AnyFunction) => {
  try {

    const fixedLines = fixFile(content);
    const fixedContent = fixedLines.join('\n').trim();

    const createEmpty = templateConfig.createEmpty !== undefined ? templateConfig.createEmpty : allAnswers.variables.createEmpty;

    if (!createEmpty && fixedContent === '') {
      logger.info('File was not created because createEmpty flag is set to false:', filePath);
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
