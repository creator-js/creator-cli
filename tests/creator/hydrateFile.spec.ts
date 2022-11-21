import fs from 'fs';

import { hydrateFile } from '../../src/creator/hydrateFile';
import * as mk from '../../src/utils/mk';

describe('Test hydrateFile() function', () => {

  const BASE_DIR = './tests/files';

  it('should hydrate file with content', () => {
    const filePath = `${BASE_DIR}/mkDir/file.txt`;
    const content = '1';

    hydrateFile(filePath, content, () => {
      expect(mk.fileExists(filePath)).toBeTruthy();
      fs.rmSync(BASE_DIR, {
        recursive: true
      });
      expect(mk.fileExists(filePath)).toBeFalsy();
    });
  });

});
