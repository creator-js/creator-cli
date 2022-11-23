import fs from 'fs';

import { createFile } from '../../src/creator/createFile';
import { IConfigTemplate } from '../../src/types/config.types';
import { IAnswersBase } from '../../src/types/types';
import * as mk from '../../src/utils/mk';

describe('Test createFile() function', () => {

  const BASE_DIR = './tests/files';

  it('should create file with content', () => {
    const filePath = `${BASE_DIR}/create/create.txt`;
    const content = '1';
    const allAnswers: IAnswersBase = {
      variables: {}
    };
    const templateConfig: IConfigTemplate = {
      name: '',
      template: ''
    };

    createFile(filePath, content, allAnswers, templateConfig, () => {
      expect(mk.fileExists(filePath)).toBeTruthy();
      fs.rmSync(`${BASE_DIR}/create`, {
        recursive: true
      });
      expect(mk.fileExists(filePath)).toBeFalsy();
    });
  });

});
