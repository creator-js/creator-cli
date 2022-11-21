import * as fs from 'fs';


import { insert } from './insert';

import { AnyFunction } from '../types/common.types';
import { ITemplateUpdate } from '../types/config.types';
import { logger } from '../utils/logger';

export const updateFile = (path: string, updates: ITemplateUpdate[], onComplete?: AnyFunction) => {
  fs.readFile(path, {
    encoding: 'utf8'
  }, (err, data) => {
    console.log(4);

    if (err) {
      logger.info(err);
      logger.error('Error in updateFile() function');
      return;
    }

    console.log(3);

    const content = insert(data, updates).trim();
    console.log(content);

    fs.writeFile(path, content, (err) => {
      if (err) {
        logger.info(err);
        logger.error('Error in updateFile() function');
      } else {
        onComplete && onComplete();
      }
    });
  });
};
