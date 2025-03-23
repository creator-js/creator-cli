import type { Question, QuestionAnswer } from 'inquirer';
import { Subject } from 'rxjs';

import type { AnyFunction } from '../types/common.types';
import type { IConfig, IConfigNext } from '../types/config.types';
import type { IAnswers, IAnswersBase } from '../types/types';
import { logger } from '../utils/logger';
import { prepareAnswers } from '../utils/prepareAnswers';

export function initUserPrompts($userPrompts: Subject<any>, answers: IAnswers, onTerminate: AnyFunction) {
  answers.structurePromptsPaused = true;
  answers.userPromptsPaused = false;

  if (!answers.currentDomain) {
    logger.error('No domain provided');
    return;
  }

  const domain = answers.domains[answers.currentDomain];

  if (domain.raw.questions && domain.raw.questions.length > 0) {
    domain.raw.questions.forEach((question: Question) => {
      $userPrompts.next({
        ...question
      });
    });
  } else {
    logger.info('No additional questions.');
    onTerminate();
  }
}

export function getUserPrompts($userPrompts: Subject<any>, answers: IAnswers, config: IConfig, q: QuestionAnswer, onComplete: AnyFunction, onNextDomain: (nextDomain: string) => void) {
  if (answers.userPromptsPaused) {
    return;
  }

  if (!answers.currentDomain) {
    logger.error('No domain provided');
    return;
  }

  const domain = answers.domains[answers.currentDomain];
  domain.answers[q.name] = q.answer;

  const shouldTerminate = isTerminateConditions(answers, q);

  if (shouldTerminate) {
    const shouldGoToNextDomain = isNextDomain(domain.raw.next, answers, config);

    if (shouldGoToNextDomain && domain.raw.next) {
      onNextDomain(domain.raw.next.name);
    } else {
      onComplete();
    }
  }
}

function isTerminateConditions(answers: IAnswers, q: QuestionAnswer): boolean {
  try {
    if (!answers.currentDomain) {
      logger.error('No domain provided');
      return true;
    }

    const domain = answers.domains[answers.currentDomain];
    const questions = domain.raw.questions;

    if (!questions || questions.length === 0) {
      logger.info('No additional questions.');
      return true;
    }

    const lastQuestion = questions[questions.length - 1];

    const currentQuestionIndex = questions.findIndex((qu: Question) => qu.name === q.name);

    const nextQuestions: boolean[] = [];
    let noMoreVisibleQuestions = false;

    for (let i = currentQuestionIndex + 1; i < questions.length; i++) {
      if (questions[i].when !== undefined) {
        const when = questions[i].when as boolean | ((answers: IAnswersBase) => boolean);

        if (typeof when === 'boolean') {
          nextQuestions.push(when);
        } else {
          nextQuestions.push(when(domain.answers));
        }
      } else {
        nextQuestions.push(true);
      }
    }

    if (nextQuestions.length > 0) {
      noMoreVisibleQuestions = nextQuestions.every((isVisible: boolean) => !isVisible);
    }

    const isLastQuestion = q.name === lastQuestion.name;

    return isLastQuestion || noMoreVisibleQuestions;
  } catch (e) {
    logger.info(e);
    logger.error('Could not terminate');
    return false;
  }
}

function isNextDomain(nextDomain: IConfigNext | undefined, answers: IAnswers, config: IConfig): boolean {
  if (nextDomain === undefined) {
    return false;
  }

  if (nextDomain.when !== undefined) {
    if (typeof nextDomain.when === 'boolean') {
      return nextDomain.when;
    }

    const allAnswers = prepareAnswers(answers, config);
    return nextDomain.when(allAnswers);
  }

  return true;
}
