
import * as fs from 'fs';
import * as path from 'path';

import { createFile } from './createFile';
import { hydrateFile } from './hydrateFile';
import { updateFile } from './updateFile';

import {
  IConfig,
  IConfigComponentTemplates,
  ITemplateInvoker
} from '../types/config.types';
import { IAnswersBase } from '../types/types';
import { dynamicImport } from '../utils/dynamicImport';
import { logger } from '../utils/logger';
import { fileExists } from '../utils/mk';
import { runLinter } from '../utils/runLinter';


export default (answers: IAnswersBase, config: IConfig) => {
  const templates = config.domains[answers.$domainIndex].templates;

  if (!templates || templates.length === 0) {
    logger.info('Could not find any templates');
    return;
  }

  templates.forEach(async (templateConfig: IConfigComponentTemplates) => {
    try {
      if (templateConfig.when && !templateConfig.when(answers)) {
        return;
      }

      let name = '';

      if (typeof templateConfig.name === 'string') {
        name = templateConfig.name;
      } else {
        name = templateConfig.name(answers);
      }

      const componentsPathNext = name.includes(answers.$root) ? '' : answers.$createPath + '/';

      if (templateConfig.template) {

        const filePath = path.join(componentsPathNext, name);

        const template = typeof templateConfig.template === 'string' ? templateConfig.template : templateConfig.template(answers);
        const invoker: ITemplateInvoker = (await dynamicImport(path.resolve(config.variables.root, template))).default;

        if (fileExists(filePath)) {

          fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
              logger.info(err);
              logger.error('Error occurred while reading file', filePath);
              return;
            }

            if (data && data.trim() === '') {
              logger.info(`Re-init file ${filePath}`);
              try {
                const content = invoker(answers).init;
                hydrateFile(filePath, content, () => {
                  logger.success('Created file', filePath);
                  runLinter(filePath);
                });
              } catch (e) {
                logger.info(e);
                logger.error('Error occurred in template', template);
              }
            } else {
              const updates = invoker(answers).updates;

              if (updates) {
                logger.info(`Updating file ${filePath}`);
                updateFile(filePath, updates, () => {
                  logger.success('Updated file', filePath);
                  runLinter(filePath);
                });
              }
            }
          });
        } else {
          logger.info(`Creating file ${filePath}`);

          try {
            const content = invoker(answers).init;
            createFile(filePath, content, () => {
              logger.success('Created file', filePath);
              runLinter(filePath);
            });
          } catch (e) {
            logger.info(e);
            logger.error('Error occurred in template', template);
          }
        }
      }
    } catch (e) {
      logger.error(e);
    }
  });
};
