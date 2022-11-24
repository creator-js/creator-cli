import { logger } from './logger';

import { IConfig } from '../types/config.types';

export const validateJSON = (config: IConfig): boolean => {
  if (config.variables?.root === undefined) {
    logger.error('Could not find "variables.root" field in config file.');
    return false;
  }

  if (config.domains === undefined) {
    logger.error('Could not find "domains" field in config file.');
    return false;
  }

  if (!Array.isArray(config.domains)) {
    logger.error('Field "domains" must be an array.');
    return false;
  }

  for (const domain of config.domains) {
    if (domain.name === undefined) {
      logger.error('Field "domains.name" must be provided.');
      return false;
    }

    if (domain.name === '') {
      logger.error('Field "domains.name" must not be an empty string.');
      return false;
    }

    if (domain.templates) {
      for (const template of domain.templates) {
        if (template.name === undefined) {
          logger.error('Field "name" must be provided for the template.');
          return false;
        }

        if (typeof template.name === 'string') {
          if (template.name === '') {
            logger.error('Field "name" of the template must not be an empty string.');
            return false;
          }
        }
      }
    }
  }

  return true;
};
