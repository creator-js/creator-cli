import * as inquirer from 'inquirer';

import {
  concat,
  Subject
} from 'rxjs';

import * as fs from 'fs';


import creator from './creator';
import {
  IConfig,
  IConfigComponentQuestion,
  IConfigDomain
} from './types/config.types';
import {
  Answer,
  IAnswersBase,
  Question
} from './types/types';
import { logger } from './utils/logger';
import { fileExists } from './utils/mk';
import { readJSON } from './utils/readJSON';
import { validateJSON } from './utils/validateJSON';


export const main = async () => {
  const config: IConfig = await readJSON();
  const isValidConfig = validateJSON(config);

  if (!isValidConfig) {
    logger.error('Invalid config');
    process.exit(0);
  }

  let structure: any = {};
  let depth = 1;
  let nextKey = undefined;
  let dynamicKey: unknown = undefined;

  const answers: IAnswersBase = {
    $domainIndex: -1,
    $createPath: config.variables.root || ''
  };

  if (config.variables) {
    Object.keys(config.variables).forEach((key: string) => {
      // @ts-ignore
      answers[`$${key}`] = config.variables[key];
    });
  }

  const initialChoices: { name: string }[] = config.domains.map((d: IConfigDomain) => {
    return {
      name: d.name
    };
  });

  const prompts: Subject<any> = new Subject();
  const userPrompts: Subject<any> = new Subject();

  // @ts-ignore
  inquirer.prompt(concat(prompts, userPrompts)).ui.process.subscribe(
    (q) => {
      answers[q.name] = q.answer;

      // Terminate

      try {
        if (answers.$domainIndex >= 0 && config.domains) {
          const questions = config.domains[answers.$domainIndex].questions;

          if (!questions || questions.length === 0) {
            logger.info('No additional questions.');
            userPrompts.complete();
            return;
          }

          const lastQuestion = questions[questions.length - 1];

          // next question is invisible and is last question
          const currentQuestionIndex = questions.findIndex((qu: IConfigComponentQuestion) => qu.name === q.name);
          const nextQuestion = questions[currentQuestionIndex + 1];

          const isNextQuestionLast = lastQuestion.name === nextQuestion?.name;
          let isNextQuestionVisible = true;

          if (nextQuestion?.when !== undefined) {
            if (typeof nextQuestion.when === 'boolean') {
              isNextQuestionVisible = nextQuestion.when;
            } else {
              isNextQuestionVisible = nextQuestion.when(answers);
            }
          }

          const nextQuestions: boolean[] = [];
          let noMoreVisibleQuestions = false;

          for (let i = currentQuestionIndex; i < questions.length; i++) {
            if (nextQuestion?.when !== undefined) {
              if (typeof nextQuestion.when === 'boolean') {
                nextQuestions.push(nextQuestion.when);
              } else {
                nextQuestions.push(nextQuestion.when(answers));
              }
            }
          }

          noMoreVisibleQuestions = prompts.isStopped && nextQuestions.every((isVisible: boolean) => !isVisible);

          if (q.name === lastQuestion.name || (isNextQuestionLast && !isNextQuestionVisible) || noMoreVisibleQuestions) {
            userPrompts.complete();
            return;
          }
        }
      } catch (e) {
        logger.info(e);
        logger.error('Could not terminate');
      }

      // -----------------------------------------------------------------------------------------------------------------

      if (prompts.isStopped) {
        return;
      }

      if (q.name === Question.Create) {
        try {
          const domain = initialChoices.find(({ name }) => name === q.answer);
          answers.$domainIndex = config.domains.findIndex((d: IConfigDomain) => d.name === domain?.name);

          if (answers.$domainIndex >= 0) {
            const str = config.domains[answers.$domainIndex].structure;
            structure = !str || Object.keys(str).length === 0 ? '' : str;
          } else {
            prompts.complete();
            userPrompts.complete();
            return;
          }
        } catch (e) {
          logger.info(e);
          logger.error('Could not define the domain');
        }

        try {
          if (typeof structure === 'string') {
            prompts.complete();

            const questions = config.domains[answers.$domainIndex].questions;

            if (!questions || questions.length === 0) {
              logger.info('No additional questions.');
              userPrompts.complete();
              return;
            }

            questions.forEach((q: IConfigComponentQuestion) => {
              userPrompts.next(q);
            });
            return;
          }
        } catch (e) {
          logger.info(e);
          logger.error('Could not complete prompts [1]');
        }

        try {
          const keys = structure ? Object.keys(structure) : [];
          dynamicKey = keys.find((k) => k[0] === ':') || undefined;

          prompts.next({
            type: 'list',
            name: `components_${depth}`,
            message: 'Where to create a file?',
            choices: () => {
              if (dynamicKey) {
                let dir: string[] = [];

                if (fileExists(answers.$createPath)) {
                  dir = fs.readdirSync(answers.$createPath);
                }

                return [Answer.CreateNew, ...dir];
              }

              return Object.keys(structure);
            }
          });
        } catch (e) {
          logger.info(e);
          logger.error('Could not determine where to create a file.');
        }

        return;
      }

      depth++;

      if (q.answer === Answer.CreateNew) {
        prompts.next({
          type: 'input',
          name: `components_${depth}`,
          message: 'How to name folder?',
          validate: (input: string) => input !== ''
        });
        return;
      }

      try {
        nextKey = dynamicKey || q.answer;
        answers.$createPath += `/${q.answer}`;
        structure = structure[nextKey];

        const keys = structure ? Object.keys(structure) : [];
        dynamicKey = keys.find((k) => k[0] === ':') || undefined;
      } catch (e) {
        logger.info(e);
        logger.error('Could not generate dynamic structure');
      }

      try {
        if (typeof structure === 'string') {
          prompts.complete();

          const questions = config.domains[answers.$domainIndex].questions;

          if (!questions || questions.length === 0) {
            logger.info('No additional questions.');
            userPrompts.complete();
            return;
          }

          questions.forEach((q: IConfigComponentQuestion) => {
            userPrompts.next(q);
          });
          return;
        }
      } catch (e) {
        logger.info(e);
        logger.error('Could not complete prompts [2]');
      }

      try {
        prompts.next({
          type: 'list',
          name: `components_${depth}`,
          message: 'Where to create a file?',
          choices: () => {
            if (dynamicKey) {
              let dir: string[] = [];

              if (fileExists(answers.$createPath)) {
                dir = fs.readdirSync(answers.$createPath);
              }

              return [Answer.CreateNew, ...dir];
            }

            return Object.keys(structure);
          }
        });
      } catch (e) {
        logger.info(e);
        logger.error('Could not generate dynamic structure');
      }
    },
    (error) => {
      console.log(error);
    },
    () => {
      answers.$createPath = answers.$createPath.split('/').filter((s: string) => s !== '').join('/');
      creator(answers, config);
    });

  prompts.next({
    type: 'list',
    name: Question.Create,
    message: 'What needs to be created?',
    choices: initialChoices,
  });
};

main();
