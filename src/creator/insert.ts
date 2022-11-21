import { checkCondition } from './checkCondition';


import { fixFile } from './fixFile';

import {
  IIndexes,
  ITemplateUpdate,
  TemplateUpdateDirection
} from '../types/config.types';
import { logger } from '../utils/logger';

export const insert = (data: string, updates: ITemplateUpdate[]): string => {
  const lines: string[] = data.split('\n');

  updates_loop:
  for (let j = 0; j < updates.length; j++) {
    const u = updates[j];

    if (!u.direction) {
      u.direction = TemplateUpdateDirection.Down;
    }

    const indexes: IIndexes = findIndexes(lines, u);
    const [fromIndex, toIndex] = indexes;

    if (fromIndex === -1 || toIndex === -1) {
      if (u.fallback) {
        updates.push(u.fallback);
      }

      continue;
    }

    if (u.direction === TemplateUpdateDirection.Down) {
      if (checkInsertCondition(lines, indexes, u)) {
        for (let i = fromIndex; i < toIndex; i++) {
          if (checkCondition(lines[i], u.searchFor)) {
            lines[i] = lines[i].replace(u.searchFor[1], u.changeWith);
            continue updates_loop;
          }
        }
      }
    } else {
      if (checkInsertCondition(lines, indexes, u)) {
        for (let i = fromIndex; i >= toIndex; i--) {

          if (checkCondition(lines[i], u.searchFor)) {
            lines[i] = lines[i].replace(u.searchFor[1], u.changeWith);
            continue updates_loop;
          }
        }
      }
    }
  }

  const fileContent = lines.join('\n');
  return fixFile(fileContent).join('\n');
};

function checkInsertCondition(lines: string[], indexes: IIndexes, u: ITemplateUpdate): boolean {
  try {
    const [fromIndex, toIndex]: IIndexes = findIndexes(lines, u);

    // [1] Single line
    if (fromIndex === toIndex) {
      return checkCondition(lines[fromIndex], u.when);
    }

    // [2] Multiple lines
    if (u.direction === TemplateUpdateDirection.Down) {
      for (let i = fromIndex; i < toIndex; i++) {
        if (!checkCondition(lines[i], u.when)) {
          return false;
        }
      }
    } else {
      for (let i = fromIndex; i >= toIndex; i--) {
        if (!checkCondition(lines[i], u.when)) {
          return false;
        }
      }
    }
  } catch (e) {
    logger.info(e);
    logger.error('Error in checkInsertCondition() function');
  }

  return true;
}

function findIndexes(lines: string[], u: ITemplateUpdate): IIndexes {
  const indexes: IIndexes = [-1, -1];
  const isDown = u.direction === TemplateUpdateDirection.Down;

  if (isDown) {
    if (u.fromLine === undefined) {
      indexes[0] = 0;
    }

    if (u.toLine === undefined) {
      indexes[1] = lines.length - 1;
    }
  } else {
    if (u.fromLine === undefined) {
      indexes[0] = lines.length - 1;
    }

    if (u.toLine === undefined) {
      indexes[1] = 0;
    }
  }

  if (indexes[0] !== -1 && indexes[1] !== -1) {
    return indexes;
  }

  function checkIndexes(lines: string[], i: number, u: ITemplateUpdate, indexes: IIndexes): boolean {
    if (indexes[0] === -1 && u.fromLine && checkCondition(lines[i], u.fromLine)) {
      indexes[0] = i;
    }

    if (indexes[1] === -1 && u.toLine && checkCondition(lines[i], u.toLine)) {
      indexes[1] = i;
    }

    return indexes[0] !== -1 && indexes[1] !== -1;
  }

  if (isDown) {
    for (let i = 0; i < lines.length; i++) {
      if (checkIndexes(lines, i, u, indexes)) {
        return indexes;
      }
    }

    // if (indexes[0] === -1) {
    //   indexes[0] = 0;
    // }
    //
    // if (indexes[1] === -1) {
    //   indexes[1] = lines.length - 1;
    // }
  } else {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (checkIndexes(lines, i, u, indexes)) {
        return indexes;
      }
    }

    // if (indexes[0] === -1) {
    //   indexes[0] = lines.length - 1;
    // }
    //
    // if (indexes[1] === -1) {
    //   indexes[1] = 0;
    // }
  }

  return indexes;
}
