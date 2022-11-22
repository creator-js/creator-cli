import inquirer, {
  Answers, QuestionAnswer
} from 'inquirer';
import {
  merge, Subject
} from 'rxjs';

import { getInitialPrompts } from './prompts/initialPrompts';
import { getStructurePrompts } from './prompts/structurePrompts';
import { getUserPrompts } from './prompts/userPrompts';
import {
  IConfig, IConfigDomain
} from './types/config.types';
import {
  IAnswers, QuestionEnum
} from './types/types';
import { logger } from './utils/logger';
import { readJSON } from './utils/readJSON';

async function main() {
  const config: IConfig = await readJSON();

  const answers: IAnswers = {
    domains: {}
  };

  if (config.variables) {
    Object.keys(config.variables).forEach((key: string) => {
      // @ts-ignore
      answers[`$${key}`] = config.variables[key];
    });
  }

  const $initialPrompts = new Subject<any>();
  const $structurePrompts = new Subject<any>();
  const $userPrompts = new Subject<any>();

  const $stream = merge($initialPrompts, $structurePrompts, $userPrompts);

  inquirer.prompt($stream).ui.process.subscribe(onEachAnswer, onError, onComplete);

  getInitialPrompts($initialPrompts, config);

  function initDomain(domain: IConfigDomain | undefined, domainName: string, question: QuestionAnswer<Answers>) {
    if (domain) {
      if (answers.domains[domain.name] !== undefined) {
        logger.error('Recursive domain reference');
      } else {
        answers.domains = {
          [domain.name]: {
            raw: domain,
            createPath: config.variables.root || '',
            structure: domain.structure || '',
            depth: 0,
            dynamicKey: undefined,
            nextKey: undefined,
            isPrevQuestionDynamic: false,
            answers: {}
          }
        };
        answers.currentDomain = domain.name;

        getStructurePrompts($structurePrompts, answers, question, () => {
          getUserPrompts($userPrompts, answers, question, terminate);
        });
      }
    } else {
      logger.error('Could not find domain', domainName);
    }
  }

  function onEachAnswer(question: QuestionAnswer) {
    if (question.name === QuestionEnum.Create) {
      answers[question.name] = question.answer;
      const domain = config.domains.find((d: IConfigDomain) => d.name === question.answer);
      initDomain(domain, question.answer, question);
    } else {
      getStructurePrompts($structurePrompts, answers, question, () => {
        getUserPrompts($userPrompts, answers, question, terminate);
      });
    }
  }

  function onComplete() {
    console.log('Complete');
    console.log(answers);
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
