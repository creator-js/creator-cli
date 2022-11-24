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

    logger.success(`Questions for the domain with name "${domainName}"`);

    if (domain) {
      if (answers.domains[domain.name] !== undefined) {
        logger.error('Recursive domain reference');
      } else {
        const defaultFilePath = config.variables.root || '';
        answers.domains = {
          ...answers.domains,
          [domain.name]: {
            raw: domain,
            filePath: switchConfig?.oldDomain?.raw.next?.skipStructure ? switchConfig?.oldDomain?.filePath || defaultFilePath : defaultFilePath,
            structure: domain.structure || undefined,
            dynamicKey: undefined,
            currentKey: undefined,
            answers: {}
          }
        };
        answers.currentDomain = domain.name;

        if (switchConfig?.oldDomain?.raw.next?.skipStructure || domain.structure === undefined) {
          initUserPrompts($userPrompts, answers, terminate);
        } else {
          getStructurePrompts($structurePrompts, answers, question, () => {
            initUserPrompts($userPrompts, answers, terminate);
          });
        }
      }
    } else {
      logger.error('Could not find domain', domainName);
    }
  }

  function switchToNextDomain(nextDomain: string) {
    const oldDomain = answers.currentDomain ? answers.domains[answers.currentDomain] : undefined;

    const switchConfig: ISwitchDomain = {
      oldDomain
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
      getUserPrompts($userPrompts, answers, config, question, terminate, switchToNextDomain);

      getStructurePrompts($structurePrompts, answers, question, () => {
        initUserPrompts($userPrompts, answers, terminate);
      });
    }
  }

  function onComplete() {
    creator(answers, config);
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

main()
  .then(() => {
    //
  })
  .catch((e) => {
    logger.info(e);
    logger.error('Error running main() function');
  });
