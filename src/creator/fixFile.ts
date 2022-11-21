import { IIndexes } from '../types/config.types';
import {
  isArrayType,
  isPrimitiveType
} from '../utils/basicTypes';
import { logger } from '../utils/logger';
import { isValidParenthesis } from '../utils/validParenthesis';

export const fixFile = (fileContent: string): string[] => {

  const fileLines: string[] = fileContent.split('\n');
  fixBasicTypeImports(fileLines);
  fixBasicTypeExports(fileLines);
  fixLinesThatStartWithComma(fileLines);

  return fileLines;
};

function fixBasicTypeExports(fileLines: string[]) {
  try {
    const typeExportsCount: Record<string, number> = {};

    for (let i = 0; i < fileLines.length; i++) {
      const exportsInterface = fileLines[i].includes('export interface');
      const exportsType = fileLines[i].includes('export type');

      if (!exportsInterface && !exportsType) {
        continue;
      }

      const split = fileLines[i].split(' ');

      if (split && split[2]) {
        const type = isArrayType(split[2]) ? split[2].substring(0, split[2].length - 2) : split[2];

        if (typeExportsCount[type] === undefined) {
          typeExportsCount[type] = 0;
        }

        typeExportsCount[type]++;
      }
    }

    for (let i = fileLines.length - 1; i >= 0; i--) {

      const exportsInterface = fileLines[i].includes('export interface');
      const exportsType = fileLines[i].includes('export type');

      if (!exportsInterface && !exportsType) {
        continue;
      }

      const indexes: IIndexes = [-1, -1];
      let singleString = '';

      indexes[0] = i;

      indexes_loop:
      for (let j = i; j < fileLines.length; j++) {
        for (let l = 0; l < fileLines[j].length; l++) {
          singleString += fileLines[j][l];

          if (exportsInterface && fileLines[j][l] === '}' && isValidParenthesis(singleString)) {
            indexes[1] = j;
            break indexes_loop;
          }

          if (exportsType && fileLines[j][l] === ';') {
            indexes[1] = j;
            break indexes_loop;
          }
        }
      }

      const splitExport = singleString.split(' ');
      let type = splitExport[2];

      if (indexes[0] !== -1 && indexes[1] !== -1) {
        if (isPrimitiveType(type)) {
          fileLines.splice(indexes[0], indexes[1] - indexes[0] + 1);
          continue;
        }

        if (isArrayType(type)) {
          type = type.replace('[]', '');

          if (typeExportsCount[type] > 1) {
            fileLines.splice(indexes[0], indexes[1] - indexes[0] + 1);
            typeExportsCount[type]--;
          } else {
            splitExport[2] = type;
            fileLines.splice(indexes[0], indexes[1] - indexes[0] + 1, splitExport.join(' '));
          }
        }
      }
    }
  } catch (e) {
    logger.dev('Error in fixBasicTypeExports');
    logger.error(e);
  }
}

function fixBasicTypeImports(fileLines: string[]) {
  for (let i = fileLines.length - 1; i >= 0; i--) {

    try {
      if (fileLines[i].includes('import')) {
        const indexes: IIndexes = [-1, -1];
        let singleString = '';

        indexes[0] = i;

        for (let j = i; j < fileLines.length; j++) {
          for (let l = 0; l < fileLines[j].length; l++) {
            singleString += fileLines[j][l];
          }

          if (fileLines[j].includes('from')) {
            indexes[1] = j;
            break;
          }
        }

        let index = 0;
        const items = ['', '', ''];

        for (let j = 0; j < singleString.length; j++) {
          const c = singleString[j];

          if (c === '}') {
            index = 2;
          }

          items[index] += c;

          if (c === '{') {
            index = 1;
          }
        }

        if (items[1] === '') {
          continue;
        }


        items[1] = items[1]
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !isPrimitiveType(s))
          .map((s: string) => isArrayType(s) ? s.substring(0, s.length - 2) : s)
          .join(',');

        if (indexes[0] !== -1 && indexes[1] !== -1) {
          const importString = items[1].trim() === '' ? '' : items.join(' ');
          fileLines.splice(indexes[0], indexes[1] - indexes[0] + 1, '\n' + importString);
        }
      }
    } catch (e) {
      logger.dev('Error in fixBasicTypeImports');
      logger.error(e);
    }
  }
}

function fixLinesThatStartWithComma(fileLines: string[]) {
  try {
    for (let i = 0; i < fileLines.length; i++) {
      const trimmedLine = fileLines[i].trimStart();

      if (trimmedLine[0] === ',') {
        fileLines[i] = fileLines[i].replace(',', '');

        const prevLine = fileLines[i - 1];

        if (prevLine) {
          const trimmedPrevLine = prevLine.trimEnd();

          if (trimmedPrevLine[trimmedPrevLine.length - 1] !== ',') {
            fileLines[i - 1] = fileLines[i - 1] + ',';
          }
        }
      }
    }
  } catch (e) {
    logger.dev('Error in fixLinesThatStartWithComma');
  }
}
