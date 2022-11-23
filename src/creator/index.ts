
import * as fs from 'fs';
import * as path from 'path';

import { createFile } from './createFile';
import { hydrateFile } from './hydrateFile';
import { updateFile } from './updateFile';

import {
  IConfig,
  IConfigComponentTemplates, IConfigDomain,
  ITemplateInvoker
} from '../types/config.types';
import { IAnswers } from '../types/types';
import { dynamicImport } from '../utils/dynamicImport';
import { logger } from '../utils/logger';
import { fileExists } from '../utils/mk';
import { prepareAnswers } from '../utils/prepareAnswers';
import { runLinter } from '../utils/runLinter';


export default (systemAnswers: IAnswers, config: IConfig) => {

  const allAnswers = prepareAnswers(systemAnswers, config);
  logger.success('[ANSWERS]');
  console.log(allAnswers);

  for (const domain in allAnswers) {
    if (domain === 'variables') {
      continue;
    }

    const domainIndex = config.domains.findIndex((d: IConfigDomain) => d.name === domain);

    if (domainIndex < 0) {
      logger.error(`Domain with name ${domain} is not in creator.config.js`);
      continue;
    }

    const answers = allAnswers[domain];
    const templates = config.domains[domainIndex].templates;

    if (!templates || templates.length === 0) {
      logger.info('Could not find any templates');
      return;
    }

    templates.forEach(async (templateConfig: IConfigComponentTemplates) => {
      try {
        if (templateConfig.when && !templateConfig.when(answers, allAnswers)) {
          return;
        }

        let name = '';

        if (typeof templateConfig.name === 'string') {
          name = templateConfig.name;
        } else {
          name = templateConfig.name(answers, allAnswers);
        }

        const componentsPathNext = name.includes(allAnswers.variables.root) ? '' : answers.filePath + '/';

        if (templateConfig.template) {

          const filePath = path.join(componentsPathNext, name);

          const template = typeof templateConfig.template === 'string' ? templateConfig.template : templateConfig.template(answers, allAnswers);
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
                  const content = invoker(answers, allAnswers).init;
                  hydrateFile(filePath, content, () => {
                    logger.success('Created file', filePath);
                    runLinter(filePath);
                  });
                } catch (e) {
                  logger.info(e);
                  logger.error('Error occurred in template', template);
                }
              } else {
                const updates = invoker(answers, allAnswers).updates;

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
              const content = invoker(answers, allAnswers).init;
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

  }
};
