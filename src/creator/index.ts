import * as fs from 'fs/promises';
import * as path from 'path';

import { fixFile } from './fixFile';
import { insert } from './insert';
import { FileChangeAction } from '../types/config.types';
import type {
  IConfig,
  IConfigDomain,
  IConfigTemplate, IFileChange,
  ITemplateInvoker
} from '../types/config.types';
import type {
  IAnswers, IAnswersBase
} from '../types/types';
import { dynamicImport } from '../utils/dynamicImport';
import { logger } from '../utils/logger';
import {
  fileExists, mkFile
} from '../utils/mk';
import { prepareAnswers } from '../utils/prepareAnswers';
import { runLinter } from '../utils/runLinter';


export default async (systemAnswers: IAnswers, config: IConfig) => {

  const answers = prepareAnswers(systemAnswers, config);
  logger.success('[ANSWERS]');
  console.log(answers);

  const changes: IFileChange[] = [];
  const templatesToProcessNumber = getTemplatesCount(answers, config);

  for (const domain in answers) {
    if (domain === 'variables') {
      continue;
    }

    const domainIndex = config.domains.findIndex((d: IConfigDomain) => d.name === domain);

    if (domainIndex < 0) {
      logger.error(`Domain with name ${domain} is not in creator.config.js`);
      continue;
    }

    const domainAnswers = answers[domain];
    const templates = config.domains[domainIndex].templates;

    if (!templates || templates.length === 0) {
      logger.info('Could not find any templates');
      return;
    }

    await Promise.all(templates.map(async (templateConfig: IConfigTemplate) => {
      try {
        if (templateConfig.when !== undefined) {
          if (typeof templateConfig.when === 'boolean') {
            if (!templateConfig.when) {
              return;
            }
          } else if (templateConfig.when(answers) === false) {
            return;
          }
        }

        let name = '';

        if (typeof templateConfig.name === 'string') {
          name = templateConfig.name;
        } else {
          name = templateConfig.name(answers);
        }

        const componentsPathNext = name.includes(answers.variables.root) ? '' : domainAnswers.filePath + '/';
        const filePath = path.join(componentsPathNext, name);

        const createEmpty = templateConfig.createEmpty !== undefined ? templateConfig.createEmpty : answers.variables.createEmpty;

        if (templateConfig.template) {
          const template = typeof templateConfig.template === 'string' ? templateConfig.template : templateConfig.template(answers);
          const invoker: ITemplateInvoker = (await dynamicImport(path.resolve(config.variables.root, template))).default;

          if (await fileExists(filePath)) {
            try {
              const data = await fs.readFile(filePath, 'utf-8');
              
              if (data && data.trim() === '') {
                const content = invoker(answers).init;
                const fixedLines = fixFile(content);
                const fixedContent = fixedLines.join('\n').trim();
                changes.push({
                  filePath,
                  content: fixedContent,
                  type: FileChangeAction.Update,
                  createEmpty
                });
                await applyChanges(changes, templatesToProcessNumber, config);
              } else {
                const updates = invoker(answers).updates;

                if (updates) {
                  changes.push({
                    filePath,
                    content: insert(data, updates).trim(),
                    type: FileChangeAction.Update,
                    createEmpty
                  });
                  await applyChanges(changes, templatesToProcessNumber, config);
                }
              }
            } catch (err) {
              logger.info(err);
              logger.error('Error occurred while reading file', filePath);
            }
          } else {
            try {
              const content = invoker(answers).init;
              const fixedLines = fixFile(content);
              const fixedContent = fixedLines.join('\n').trim();

              changes.push({
                filePath,
                content: fixedContent,
                type: FileChangeAction.Create,
                createEmpty
              });
              await applyChanges(changes, templatesToProcessNumber, config);
            } catch (e) {
              logger.info(e);
              logger.error('Error occurred in template', template);
            }
          }
        } else {
          changes.push({
            filePath,
            content: '',
            type: FileChangeAction.Create,
            createEmpty
          });
          await applyChanges(changes, templatesToProcessNumber, config);
        }
      } catch (e) {
        logger.error(e);
      }
    }));
  }
};

async function applyChanges(changes: IFileChange[], templatesToProcessNumber: number, config: IConfig) {
  if (changes.length !== templatesToProcessNumber) {
    return;
  }

  await Promise.all(changes.map(async (change) => {
    if (change.type === FileChangeAction.Create) {
      if (!change.createEmpty && change.content === '') {
        logger.info('File was not created because createEmpty flag is set to false:', change.filePath);
        return;
      }

      logger.info('Creating file', change.filePath);
      await mkFile(change.filePath, change.content);
      logger.success('Created file', change.filePath);
      if (config.variables?.runLinter) {
        await runLinter(change.filePath);
      }
    } else {
      logger.info('Updating file', change.filePath);
      try {
        await fs.writeFile(change.filePath, change.content);
        logger.success('Updated file', change.filePath);
        if (config.variables?.runLinter) {
          await runLinter(change.filePath);
        }
      } catch (err) {
        logger.info(err);
        logger.error('Error in updateFile() function');
      }
    }
  }));
}

function getTemplatesCount(answers: IAnswersBase, config: IConfig): number {
  let templatesToProcessNumber = 0;

  for (const domain in answers) {
    if (domain === 'variables') {
      continue;
    }

    const domainIndex = config.domains.findIndex((d: IConfigDomain) => d.name === domain);

    if (domainIndex < 0) {
      continue;
    }

    const templates = config.domains[domainIndex].templates;

    if (!templates || templates.length === 0) {
      continue;
    }

    for (const templateConfig of templates) {
      if (templateConfig.when !== undefined) {
        if (typeof templateConfig.when === 'boolean') {
          if (!templateConfig.when) {
            continue;
          }
        } else if (!templateConfig.when(answers)) {
          continue;
        }
      }

      templatesToProcessNumber++;
    }
  }

  return templatesToProcessNumber;
}
