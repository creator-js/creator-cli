import { IDomain } from './config.types';

export type IAnswersBase = Record<string, any>;

export interface IAnswersCore {
  domains: Record<string, IDomain>;
}

export type IAnswers = IAnswersBase & IAnswersCore;

export enum QuestionEnum {
  Create = 'create',
}

export enum Answer {
  CreateNew = '[Create New]'
}
