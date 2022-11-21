import fs from 'fs';

import { createFile } from '../../src/creator/createFile';
import * as mk from '../../src/utils/mk';

describe('Test createFile() function', () => {

  const BASE_DIR = './tests/files';

  it('should create file with content', () => {
    const filePath = `${BASE_DIR}/crate/create.txt`;
    const content = '1';

    createFile(filePath, content, () => {
      expect(mk.fileExists(filePath)).toBeTruthy();
      fs.rmSync(`${BASE_DIR}/crate`, {
        recursive: true
      });
      expect(mk.fileExists(filePath)).toBeFalsy();
    });
  });

});
