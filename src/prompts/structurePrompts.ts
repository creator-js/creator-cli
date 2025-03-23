import type { QuestionAnswer } from 'inquirer';

import { Subject } from 'rxjs';

import fs from 'fs';

import type { AnyFunction } from '../types/common.types';
import type { IAnswers } from '../types/types';
import {
  Answer, QuestionEnum
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
  domain.answers[q.name] = q.answer;

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
    // If we select 'index', don't add it to the filePath - files will be created directly here
    if (q.answer === 'index') {
      const componentName = domain.filePath.split('/').at(-1);
      domain.answers.componentName = componentName;
      domain.structure = domain.structure[domain.dynamicKey || q.answer];
      domain.dynamicKey = undefined;
    } else {
      // For any other name, add it to filePath - a folder will be created with this name
      domain.filePath += `/${q.answer}`;
      domain.structure = domain.structure[domain.dynamicKey || q.answer];
      domain.dynamicKey = undefined;
    }
  } else if (q.name.includes(QuestionEnum.Create)) {
    // Do nothing
  } else if (q.name === 'componentName') {
    // Handle the component name answer and complete
    domain.answers.componentName = q.answer;

    // If createFolder is true, add the component name to the file path
    if (domain.createFolder) {
      domain.filePath += `/${q.answer}`;
    }

    onComplete();
    return;
  } else {
    // Otherwise the question does not belong here
    return;
  }

  // Check if we've reached a leaf node
  if (domain.structure && typeof domain.structure === 'object' && domain.structure.isLeaf) {
    domain.createFolder = domain.structure.createFolder ?? false;

    // If we're at a leaf node and createFolder is true, we need to create a new folder with the component name
    if (domain.structure.createFolder) {
      // Add the component name question to the stream
      $structurePrompts.next({
        type: 'input',
        name: 'componentName',
        message: 'How to name the component?',
        validate: (input: string) => input !== ''
      });
    } else {
      // When createFolder is false, we're already at the correct location
      // The component name will be used for the file name, not the folder
      onComplete();
    }

    return;
  }

  // If we have a structure object but it's not a leaf node, continue traversing
  if (typeof domain.structure === 'object') {
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
  } else {
    onComplete();
  }
}
