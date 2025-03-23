import type { Question } from 'inquirer';

import type { IAnswersBase } from './types';


export interface IConfig {
  variables: IConfigVariables;
  domains: IConfigDomain[];
}

export interface IConfigDomain {
  name: string;
  templates: IConfigTemplate[];
  structure?: any;
  questions?: Question[];
  next?: IConfigNext;
  hidden?: boolean;
}

export interface IConfigTemplate {
  name: string | ((answers: IAnswersBase, allAnswers?: IAnswersBase) => string);
  template: string | ((answers: IAnswersBase, allAnswers?: IAnswersBase) => string);
  when?: (answers: IAnswersBase, allAnswers?: IAnswersBase) => boolean;
  createEmpty?: boolean;
}

export interface IConfigNext {
  name: string;
  when?: boolean | ((answers: IAnswersBase) => boolean);
  skipStructure?: boolean;
}

export interface IConfigVariablesRequired {
  root: string;
  createEmpty?: boolean
  runLinter?: boolean
}

export type IConfigVariables = IConfigVariablesRequired & Record<string, any>;

export type ITemplateInvoker = (answers: IAnswersBase, allAnswers?: IAnswersBase) => ITemplate;

export interface ITemplate {
  init: string;
  updates: ITemplateUpdate[]
}

export interface ITemplateUpdate {
  direction?: TemplateUpdateDirection;
  fromLine?: [TemplateUpdateOperator, string],
  toLine?: [TemplateUpdateOperator, string],
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
  createFolder?: boolean;
}

export enum TemplateUpdateOperator {
  NotIncludes = 'not includes',
  Includes = 'includes',
  Equal = '===',
  NotEqual = '!==',
  StartsWith = 'starts with',
  EndsWith = 'ends with',
  Matches = 'matches',
  ContainsWord = 'contains word',
  IsEmpty = 'is empty',
  IsNotEmpty = 'is not empty'
}

export enum TemplateUpdateDirection {
  Up = 'up',
  Down = 'down'
}
export enum FileChangeAction {
  Update = 'update',
  Create = 'create'
}


export type IIndexes = [number, number];

export interface ISwitchDomain {
  oldDomain?: IDomain;
}

export interface IFileChange {
  filePath: string;
  content: string;
  type: FileChangeAction;
  createEmpty: boolean;
}
