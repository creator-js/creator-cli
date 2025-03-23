import { checkCondition } from './checkCondition';
import { fixFile } from './fixFile';
import type { IIndexes, ITemplateUpdate } from '../types/config.types';
import { TemplateUpdateDirection, TemplateUpdateOperator } from '../types/config.types';
import { logger } from '../utils/logger';

export const insert = (data: string, updates: ITemplateUpdate[]): string => {
  if (!data || !updates?.length) return data;

  const lines = data.split('\n');
  const lineCount = lines.length;

  updates_loop:
  for (const update of updates) {
    try {
      // Validate update
      if (!update.searchFor || !update.changeWith) {
        logger.error('Invalid update configuration:', update);
        continue;
      }

      // Set default direction
      const direction = update.direction || TemplateUpdateDirection.Down;

      // Find indexes once
      const indexes = findIndexes(lines, update);
      const [fromIndex, toIndex] = indexes;

      if (fromIndex === -1 || toIndex === -1) {
        if (update.fallback) {
          updates.push(update.fallback);
        }
        continue;
      }

      // Check conditions before processing
      if (!checkInsertCondition(lines, indexes, update)) {
        continue;
      }

      // Process lines based on direction
      if (direction === TemplateUpdateDirection.Down) {
        for (let i = fromIndex; i < toIndex; i++) {
          if (i < 0 || i >= lineCount) continue;

          if (checkCondition(lines[i], update.searchFor)) {
            // Only replace the exact search string
            if (update.searchFor[0] === TemplateUpdateOperator.Equal) {
              lines[i] = update.changeWith;
            } else {
              lines[i] = lines[i].replace(update.searchFor[1], update.changeWith);
            }
            continue updates_loop;
          }
        }
      } else {
        for (let i = fromIndex; i >= toIndex; i--) {
          if (i < 0 || i >= lineCount) continue;

          if (checkCondition(lines[i], update.searchFor)) {
            // Only replace the exact search string
            if (update.searchFor[0] === TemplateUpdateOperator.Equal) {
              lines[i] = update.changeWith;
            } else {
              lines[i] = lines[i].replace(update.searchFor[1], update.changeWith);
            }
            continue updates_loop;
          }
        }
      }
    } catch (e) {
      logger.error('Error processing update:', e);
    }
  }

  return fixFile(lines.join('\n')).join('\n');
};

function findIndexes(lines: string[], update: ITemplateUpdate): IIndexes {
  const indexes: IIndexes = [-1, -1];
  const isDown = update.direction !== TemplateUpdateDirection.Up;
  const lineCount = lines.length;

  // Set default indexes based on direction
  if (isDown) {
    indexes[0] = update.fromLine === undefined ? 0 : -1;
    indexes[1] = update.toLine === undefined ? lineCount - 1 : -1;
  } else {
    indexes[0] = update.fromLine === undefined ? lineCount - 1 : -1;
    indexes[1] = update.toLine === undefined ? 0 : -1;
  }

  // Return if using default indexes
  if (indexes[0] !== -1 && indexes[1] !== -1) {
    return indexes;
  }

  // Find specific indexes based on conditions
  if (isDown) {
    for (let i = 0; i < lineCount; i++) {
      if (indexes[0] === -1 && update.fromLine && checkCondition(lines[i], update.fromLine)) {
        indexes[0] = i;
      }
      if (indexes[1] === -1 && update.toLine && checkCondition(lines[i], update.toLine)) {
        indexes[1] = i;
      }
      if (indexes[0] !== -1 && indexes[1] !== -1) break;
    }
  } else {
    for (let i = lineCount - 1; i >= 0; i--) {
      if (indexes[0] === -1 && update.fromLine && checkCondition(lines[i], update.fromLine)) {
        indexes[0] = i;
      }
      if (indexes[1] === -1 && update.toLine && checkCondition(lines[i], update.toLine)) {
        indexes[1] = i;
      }
      if (indexes[0] !== -1 && indexes[1] !== -1) break;
    }
  }

  return indexes;
}

function checkInsertCondition(lines: string[], indexes: IIndexes, update: ITemplateUpdate): boolean {
  try {
    const [fromIndex, toIndex] = indexes;

    // Single line check
    if (fromIndex === toIndex) {
      return checkCondition(lines[fromIndex], update.when);
    }

    // Multiple lines check
    if (update.direction === TemplateUpdateDirection.Down) {
      for (let i = fromIndex; i < toIndex; i++) {
        if (!checkCondition(lines[i], update.when)) {
          return false;
        }
      }
    } else {
      for (let i = fromIndex; i >= toIndex; i--) {
        if (!checkCondition(lines[i], update.when)) {
          return false;
        }
      }
    }

    return true;
  } catch (e) {
    logger.error('Error in checkInsertCondition() function:', e);
    return false;
  }
}
