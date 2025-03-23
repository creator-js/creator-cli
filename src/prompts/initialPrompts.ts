import { Subject } from 'rxjs';

import type {
  IConfig, IConfigDomain
} from '../types/config.types';
import type {
  IAnswers
} from '../types/types';
import { QuestionEnum } from '../types/types';
export function getInitialPrompts($initialPrompts: Subject<any>, answers: IAnswers, config: IConfig) {
  if (answers.initialPromptsPaused) {
    return;
  }

  const initialChoices: { name: string }[] = config.domains
    .filter((d: IConfigDomain) => !d.hidden)
    .map((d: IConfigDomain) => {
      return {
        name: d.name
      };
    });

  $initialPrompts.next({
    type: 'list',
    name: QuestionEnum.Create,
    message: 'What do you want to create?',
    choices: initialChoices
  });
}
