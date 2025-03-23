import type { IConfig } from '../types/config.types';
import type { IAnswers, IAnswersBase } from '../types/types';

export const prepareAnswers = (answers: IAnswers, config: IConfig):IAnswersBase => {
  const result: IAnswersBase = {
    variables: config.variables
  };

  for (const domain in answers.domains) {

    if (result[domain] === undefined) {
      result[domain] = {};
    }

    result[domain].filePath = answers.domains[domain].filePath.split('/').filter((s: string) => s !== '').join('/');

    for (const key in answers.domains[domain].answers) {
      if (key.indexOf('_file_') < 0 && key.indexOf('_new-folder_') < 0) {
        result[domain][key] = answers.domains[domain].answers[key];
      }
    }
  }

  return result;
};
