import { QuestionAnswer } from 'inquirer';
import { Subject } from 'rxjs';


import fs from 'fs';

import { AnyFunction } from '../types/common.types';
import {
  Answer, IAnswers
} from '../types/types';
import { logger } from '../utils/logger';
import { fileExists } from '../utils/mk';

export function getStructurePrompts(structurePrompts: Subject<any>, answers: IAnswers, q: QuestionAnswer, onComplete: AnyFunction) {
  const domain = answers.domains[answers.currentDomain];

  domain.depth++;

  if (q.name.indexOf('_file_') === 0) {
    if (q.answer === Answer.CreateNew) {
      domain.currentKey = domain.dynamicKey;

      if (domain.currentKey) {
        domain.structure = domain.structure[domain.currentKey];
      }
    } else {
      domain.currentKey = domain.dynamicKey || q.answer;

      if (!domain.dynamicKey && domain.currentKey) {
        domain.structure = domain.structure[domain.currentKey];
      }

      domain.createPath += `/${q.answer}`;
    }
  } else {
    domain.currentKey = undefined;
  }

  if (q.answer === Answer.CreateNew) {
    structurePrompts.next({
      type: 'input',
      name: `_file_${domain.depth}`,
      message: 'How to name folder?',
      validate: (input: string) => input !== ''
    });
    return;
  }

  if (typeof domain.structure === 'string') {
    onComplete();
  } else {
    try {
      const keys = domain.structure ? Object.keys(domain.structure) : [];
      domain.dynamicKey = keys.find((k) => k[0] === ':') || undefined;

      structurePrompts.next({
        type: 'list',
        name: `_file_${domain.depth}`,
        message: 'Where to create a file?',
        choices: () => {
          if (domain.dynamicKey) {
            let dir: string[] = [];

            if (fileExists(domain.createPath)) {
              dir = fs.readdirSync(domain.createPath);
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
