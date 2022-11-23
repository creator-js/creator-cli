import { QuestionAnswer } from 'inquirer';
import { Subject } from 'rxjs';

import { AnyFunction } from '../types/common.types';
import {
  IConfig,
  IConfigComponentQuestion, IConfigNext
} from '../types/config.types';
import {
  IAnswers, IAnswersBase
} from '../types/types';
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
    domain.raw.questions.forEach((question: IConfigComponentQuestion) => {
      $userPrompts.next(question);
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

  const domainAnswers = prepareAnswers(answers, config)[domain.raw.name];
  const shouldTerminate = isTerminateConditions(answers, q, domainAnswers);

  if (shouldTerminate) {
    const shouldGoToNextDomain = isNextDomain(domain.raw.next, domainAnswers);

    if (shouldGoToNextDomain) {
      onNextDomain((domain.raw.next as IConfigNext).name);
    } else {
      onComplete();
    }
  }
}

function isTerminateConditions(answers: IAnswers, q: QuestionAnswer, domainAnswers: IAnswers): boolean {
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

    const currentQuestionIndex = questions.findIndex((qu: IConfigComponentQuestion) => qu.name === q.name);
    const nextQuestion = questions[currentQuestionIndex + 1];

    const nextQuestions: boolean[] = [];
    let noMoreVisibleQuestions = false;

    for (let i = currentQuestionIndex; i < questions.length; i++) {
      if (nextQuestion?.when !== undefined) {
        if (typeof nextQuestion.when === 'boolean') {
          nextQuestions.push(nextQuestion.when);
        } else {
          nextQuestions.push(nextQuestion.when(domainAnswers));
        }
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

function isNextDomain(nextDomain: IConfigNext | undefined, domainAnswers: IAnswersBase): boolean {
  if (nextDomain === undefined) {
    return false;
  }

  if (nextDomain.when !== undefined) {
    if (typeof nextDomain.when === 'boolean') {
      return nextDomain.when;
    }

    return nextDomain.when(domainAnswers);
  }

  return true;
}
