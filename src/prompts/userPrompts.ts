import { QuestionAnswer } from 'inquirer';
import { Subject } from 'rxjs';

import { AnyFunction } from '../types/common.types';
import { IConfigComponentQuestion } from '../types/config.types';
import { IAnswers } from '../types/types';
import { logger } from '../utils/logger';

export function getUserPrompts(userPrompts: Subject<any>, answers: IAnswers, q: QuestionAnswer, onComplete: AnyFunction) {
  const domain = answers.domains[answers.currentDomain];

  domain.answers[q.name] = q.answer;

  // if (isTerminateConditions(answers, q)) {
  //   onComplete();
  // }

  if (domain.raw.questions && domain.raw.questions.length > 0) {
    domain.raw.questions.forEach((question: IConfigComponentQuestion) => {
      userPrompts.next(question);
    });
  }
}

function isTerminateConditions(answers: IAnswers, q: QuestionAnswer): boolean {
  try {
    const domain = answers.domains[answers.currentDomain];
    const questions = domain.raw.questions;

    if (!questions || questions.length === 0) {
      logger.info('No additional questions.');
      return true;
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

    noMoreVisibleQuestions = nextQuestions.every((isVisible: boolean) => !isVisible);

    return q.name === lastQuestion.name || (isNextQuestionLast && !isNextQuestionVisible) || noMoreVisibleQuestions;
  } catch (e) {
    logger.info(e);
    logger.error('Could not terminate');
    return false;
  }
}
