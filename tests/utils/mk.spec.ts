import * as fs from 'fs';
import * as path from 'path';


import * as mk from '../../src/utils/mk';

describe('Test mk functions', () => {

  const BASE_DIR = './tests/files';

  it('should normalizePath path', () => {
    const filePath = '/path\\with/different\\slashes/';
    const expected = '/path/with/different/slashes/';
    expect(mk.normalizePath(filePath)).toBe(expected);
  });

  it('should return true when file exists', () => {
    const filePath = path.resolve('./tests/utils/mk.spec.ts');
    expect(mk.fileExists(filePath)).toBeTruthy();
  });

  it('should return false when does not exist', () => {
    const filePath = '/wrong/path';
    expect(mk.fileExists(filePath)).toBeFalsy();
  });

  it('should make new dir', () => {
    const filePath = `${BASE_DIR}/mkDir1/mkDir2`;
    mk.mkDir(filePath);
    expect(mk.fileExists(filePath)).toBeTruthy();
    fs.rmSync(BASE_DIR, {
      recursive: true
    });
    expect(mk.fileExists(filePath)).toBeFalsy();
  });

  it('should make new file', () => {
    const filePath = `${BASE_DIR}/mkDir2/file.txt`;
    mk.mkFile(filePath, 'test', () => {
      expect(mk.fileExists(filePath)).toBeTruthy();
      fs.rmSync(BASE_DIR, {
        recursive: true
      });
      expect(mk.fileExists(filePath)).toBeFalsy();
    });
  });
});
