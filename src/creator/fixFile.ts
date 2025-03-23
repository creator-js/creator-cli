import type { IIndexes } from '../types/config.types';
import {
  isArrayType,
  isPrimitiveType
} from '../utils/basicTypes';
import { logger } from '../utils/logger';
import { isValidParenthesis } from '../utils/validParenthesis';

export const fixFile = (fileContent: string): string[] => {
  if (!fileContent) return [];

  const lines = fileContent.split('\n');
  
  // Process in place
  fixBasicTypeImports(lines);
  fixBasicTypeExports(lines);
  fixLinesThatStartWithComma(lines);
  
  // Clean up multiple empty lines
  return cleanEmptyLines(lines);
};

// Helper function to clean up multiple empty lines
function cleanEmptyLines(lines: string[]): string[] {
  const result: string[] = [];
  let lastWasEmpty = false;

  for (const line of lines) {
    const isEmpty = line.trim() === '';
    if (!isEmpty || !lastWasEmpty) {
      result.push(line);
    }
    lastWasEmpty = isEmpty;
  }

  return result;
}

function fixBasicTypeExports(lines: string[]) {
  try {
    const typeExportsCount: Record<string, number> = {};

    // First pass: count type exports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const exportsInterface = line.includes('export interface');
      const exportsType = line.includes('export type');

      if (!exportsInterface && !exportsType) continue;

      const split = line.split(' ');
      if (split && split[2]) {
        const type = isArrayType(split[2]) ? split[2].substring(0, split[2].length - 2) : split[2];
        typeExportsCount[type] = (typeExportsCount[type] || 0) + 1;
      }
    }

    // Second pass: process exports
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const exportsInterface = line.includes('export interface');
      const exportsType = line.includes('export type');

      if (!exportsInterface && !exportsType) continue;

      const indexes: IIndexes = [-1, -1];
      let singleString = '';
      indexes[0] = i;

      indexes_loop:
      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        singleString += currentLine;

        if (exportsInterface && currentLine.includes('}') && isValidParenthesis(singleString)) {
          indexes[1] = j;
          break indexes_loop;
        }

        if (exportsType && currentLine.includes(';')) {
          indexes[1] = j;
          break indexes_loop;
        }
      }

      const splitExport = singleString.split(' ');
      let type = splitExport[2];

      if (indexes[0] !== -1 && indexes[1] !== -1) {
        if (isPrimitiveType(type)) {
          lines.splice(indexes[0], indexes[1] - indexes[0] + 1);
          continue;
        }

        if (isArrayType(type)) {
          type = type.replace('[]', '');
          if (typeExportsCount[type] > 1) {
            lines.splice(indexes[0], indexes[1] - indexes[0] + 1);
            typeExportsCount[type]--;
          } else {
            splitExport[2] = type;
            lines.splice(indexes[0], indexes[1] - indexes[0] + 1, splitExport.join(' '));
          }
        }
      }
    }
  } catch (e) {
    logger.error('Error in fixBasicTypeExports:', e);
  }
}

function fixBasicTypeImports(lines: string[]) {
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const line = lines[i];
      if (!line.includes('import')) continue;

      const indexes: IIndexes = [-1, -1];
      let singleString = '';
      indexes[0] = i;

      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        singleString += currentLine;

        if (currentLine.includes('from')) {
          indexes[1] = j;
          break;
        }
      }

      let index = 0;
      const items = ['', '', ''];

      for (let j = 0; j < singleString.length; j++) {
        const c = singleString[j];
        if (c === '}') index = 2;
        items[index] += c;
        if (c === '{') index = 1;
      }

      if (!items[1]) continue;

      items[1] = items[1]
        .split(',')
        .map(s => s.trim())
        .filter(s => !isPrimitiveType(s))
        .map(s => isArrayType(s) ? s.substring(0, s.length - 2) : s)
        .join(',');

      if (indexes[0] !== -1 && indexes[1] !== -1) {
        const importString = items[1].trim() ? items.join(' ') : '';
        // Only add newline if the previous line is not empty
        const prevLine = lines[indexes[0] - 1];
        const prefix = prevLine && prevLine.trim() !== '' ? '\n' : '';
        lines.splice(indexes[0], indexes[1] - indexes[0] + 1, prefix + importString);
      }
    } catch (e) {
      logger.error('Error in fixBasicTypeImports:', e);
    }
  }
}

function fixLinesThatStartWithComma(lines: string[]) {
  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trimStart();

      if (trimmedLine[0] === ',') {
        lines[i] = line.replace(',', '');

        const prevLine = lines[i - 1];
        if (prevLine) {
          const trimmedPrevLine = prevLine.trimEnd();
          if (trimmedPrevLine[trimmedPrevLine.length - 1] !== ',') {
            lines[i - 1] = prevLine + ',';
          }
        }
      }
    }
  } catch (e) {
    logger.error('Error in fixLinesThatStartWithComma:', e);
  }
}
