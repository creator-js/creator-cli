import { Subject } from 'rxjs';

import {
  IConfig, IConfigDomain
} from '../types/config.types';
import { QuestionEnum } from '../types/types';

export function getInitialPrompts($initialPrompts: Subject<any>, config: IConfig) {
  const initialChoices: { name: string }[] = config.domains.map((d: IConfigDomain) => {
    return {
      name: d.name
    };
  });

  const initialPrompts = [
    {
      type: 'list',
      name: QuestionEnum.Create,
      message: 'What needs to be created?',
      choices: initialChoices,
    }
  ];

  initialPrompts.forEach((prompt) => {
    $initialPrompts.next(prompt);
  });
}
