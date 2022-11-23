import { IAnswersBase } from './types';

export interface IConfig {
  variables: IConfigVariables;
  domains: IConfigDomain[];
}

export interface IConfigDomain {
  name: string;
  structure: any;
  templates: IConfigTemplate[];
  questions: IConfigComponentQuestion[];
  next?: IConfigNext;
}

export interface IConfigTemplate {
  name: string | ((answers: IAnswersBase, allAnswers?: IAnswersBase) => string);
  template: string | ((answers: IAnswersBase, allAnswers?: IAnswersBase) => string);
  when?: (answers: IAnswersBase, allAnswers?: IAnswersBase) => boolean;
  createEmpty?: boolean;
}

export interface IConfigComponentQuestion {
  name: string;
  message: string;
  type: string;
  validate?: (input: any) => boolean;
  when?: boolean | ((answers: IAnswersBase) => boolean);
}

export interface IConfigNext {
  name: string;
  when?: boolean | ((answers: IAnswersBase) => boolean);
  skipStructure?: boolean;
}

export interface IConfigVariablesRequired {
  root: string;
  createEmpty?: boolean
}

export type IConfigVariables = IConfigVariablesRequired & Record<string, any>;

export type ITemplateInvoker = (answers: IAnswersBase, allAnswers?: IAnswersBase) => ITemplate;

export interface ITemplate {
  init: string;
  updates: ITemplateUpdate[]
}

export interface ITemplateUpdate {
  fromLine?: [TemplateUpdateOperator, string],
  toLine?: [TemplateUpdateOperator, string],
  direction?: TemplateUpdateDirection;
  searchFor: [TemplateUpdateOperator, string],
  changeWith: string;
  when?: [TemplateUpdateOperator, string] | boolean;
  fallback?: ITemplateUpdate;
}

export interface IDomain {
  raw: IConfigDomain;
  filePath: string;
  structure: any;
  dynamicKey: string | undefined;
  currentKey: string | undefined;
  answers: Record<string, any>;
}

export enum TemplateUpdateOperator {
  NotIncludes = 'not includes',
  Includes = 'includes',
  Equal = '===',
  NotEqual = '!=='
}

export enum TemplateUpdateDirection {
  Up = 'up',
  Down = 'down'
}

export type IIndexes = [number, number];

export interface ISwitchDomain {
  oldDomain?: IDomain;
  skipStructure?: boolean;
}
