import { Subject } from 'rxjs';

import {
  IConfig, IConfigDomain
} from '../types/config.types';
import {
  IAnswers, QuestionEnum
} from '../types/types';

export function getInitialPrompts($initialPrompts: Subject<any>, answers: IAnswers, config: IConfig) {
  const initialChoices: { name: string }[] = config.domains.map((d: IConfigDomain) => {
    return {
      name: d.name
    };
  });

  $initialPrompts.next({
    type: 'list',
    name: QuestionEnum.Create,
    message: 'What needs to be created?',
    choices: initialChoices
  });
}
