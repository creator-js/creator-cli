import inquirer, { QuestionAnswer } from 'inquirer';
import {
  merge, Subject
} from 'rxjs';

import creator from './creator';
import { getInitialPrompts } from './prompts/initialPrompts';
import { getStructurePrompts } from './prompts/structurePrompts';
import {
  getUserPrompts, initUserPrompts
} from './prompts/userPrompts';
import {
  IConfig, IConfigDomain, ISwitchDomain
} from './types/config.types';
import {
  IAnswers, QuestionEnum
} from './types/types';
import { logger } from './utils/logger';
import { prepareAnswers } from './utils/prepareAnswers';
import { readJSON } from './utils/readJSON';

async function main() {
  const config: IConfig = await readJSON();

  const answers: IAnswers = {
    domains: {},
    depth: 0,
    currentDomain: undefined,
    initialPromptsPaused: false,
    structurePromptsPaused: true,
    userPromptsPaused: true,
  };

  const $initialPrompts = new Subject<any>();
  const $structurePrompts = new Subject<any>();
  const $userPrompts = new Subject<any>();

  const $stream = merge($initialPrompts, $structurePrompts, $userPrompts);

  inquirer.prompt($stream).ui.process.subscribe(onEachAnswer, onError, onComplete);

  getInitialPrompts($initialPrompts, answers, config);

  function initDomainPrompts(domain: IConfigDomain | undefined, domainName: string, question: QuestionAnswer, switchConfig?: ISwitchDomain) {
    answers.structurePromptsPaused = false;
    answers.userPromptsPaused = true;

    if (domain) {
      if (answers.domains[domain.name] !== undefined) {
        logger.error('Recursive domain reference');
      } else {
        answers.domains = {
          ...answers.domains,
          [domain.name]: {
            raw: domain,
            filePath: switchConfig?.oldDomain?.filePath || config.variables.root || '',
            structure: domain.structure || '',
            dynamicKey: undefined,
            currentKey: undefined,
            answers: {}
          }
        };
        answers.currentDomain = domain.name;

        if (switchConfig?.skipStructure) {
          initUserPrompts($userPrompts, answers);
        } else {
          getStructurePrompts($structurePrompts, answers, question, () => {
            initUserPrompts($userPrompts, answers);
          });
        }
      }
    } else {
      logger.error('Could not find domain', domainName);
    }
  }

  function switchToNextDomain(nextDomain: string) {
    const oldDomain = answers.currentDomain ? answers.domains[answers.currentDomain] : undefined;
    const skipStructure = oldDomain?.raw.next?.skipStructure || false;

    const switchConfig: ISwitchDomain = {
      oldDomain,
      skipStructure
    };

    const domain = config.domains.find((d: IConfigDomain) => d.name === nextDomain);
    const question = {
      name: QuestionEnum.Create + answers.depth,
      answer: nextDomain
    };
    initDomainPrompts(domain, nextDomain, question, switchConfig);
  }

  function onEachAnswer(question: QuestionAnswer) {
    if (question.name === QuestionEnum.Create) {
      answers.initialPromptsPaused = true;
      answers[question.name] = question.answer;
      const domain = config.domains.find((d: IConfigDomain) => d.name === question.answer);
      initDomainPrompts(domain, question.answer, question);
    } else {
      getStructurePrompts($structurePrompts, answers, question, () => {
        initUserPrompts($userPrompts, answers);
      });

      getUserPrompts($userPrompts, answers, config, question, terminate, switchToNextDomain);
    }
  }

  function onComplete() {
    const result = prepareAnswers(answers, config);
    logger.success('answers', result);
    creator(result, config);
  }

  function onError(e: any) {
    console.log(e);
    console.log('Error');
  }

  function terminate() {
    $initialPrompts.complete();
    $structurePrompts.complete();
    $userPrompts.complete();
  }
}

main();
