import { QuestionAnswer } from 'inquirer';
import { Subject } from 'rxjs';


import fs from 'fs';

import { AnyFunction } from '../types/common.types';
import {
  Answer, IAnswers
} from '../types/types';
import { logger } from '../utils/logger';
import { fileExists } from '../utils/mk';

export function getStructurePrompts($structurePrompts: Subject<any>, answers: IAnswers, q: QuestionAnswer, onComplete: AnyFunction) {
  if (answers.structurePromptsPaused) {
    return;
  }

  if (!answers.currentDomain) {
    logger.error('No domain provided');
    return;
  }

  const domain = answers.domains[answers.currentDomain];

  answers.depth++;

  if (q.answer === Answer.CreateNew) {
    $structurePrompts.next({
      type: 'input',
      name: `_new-folder_${answers.depth}`,
      message: 'How to name folder?',
      validate: (input: string) => input !== ''
    });
    return;
  }

  if (q.name.indexOf('_new-folder_') === 0) {
    domain.filePath += `/${q.answer}`;
    domain.structure = domain.structure[domain.dynamicKey as string];
    domain.dynamicKey = undefined;
  } else if (q.name.indexOf('_file_') === 0) {
    domain.filePath += `/${q.answer}`;
    domain.structure = domain.structure[domain.dynamicKey || q.answer];
    domain.dynamicKey = undefined;
  } else {
    domain.currentKey = undefined;
  }

  if (typeof domain.structure === 'string') {
    onComplete();
  } else {
    try {
      const keys = domain.structure ? Object.keys(domain.structure) : [];
      domain.dynamicKey = keys.find((k) => k[0] === '$') || undefined;

      $structurePrompts.next({
        type: 'list',
        name: `_file_${answers.depth}`,
        message: 'Where to create a file?',
        choices: () => {
          if (domain.dynamicKey) {
            let dir: string[] = [];

            if (fileExists(domain.filePath)) {
              dir = fs.readdirSync(domain.filePath);
            }

            return [Answer.CreateNew, ...dir];
          }

          return Object.keys(domain.structure);
        }
      });
    } catch (e) {
      logger.info(e);
      logger.error('Could not generate dynamic structure');
    }
  }
}
