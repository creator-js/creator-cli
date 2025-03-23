import { TemplateUpdateOperator } from '../types/config.types';
import { logger } from '../utils/logger';

const OPERATOR_FUNCTIONS: Record<TemplateUpdateOperator, (line: string, value: string) => boolean> = {
  [TemplateUpdateOperator.NotIncludes]: (line, value) => !line.includes(value),
  [TemplateUpdateOperator.Includes]: (line, value) => line.includes(value),
  [TemplateUpdateOperator.NotEqual]: (line, value) => line !== value,
  [TemplateUpdateOperator.Equal]: (line, value) => line === value,
  [TemplateUpdateOperator.StartsWith]: (line, value) => line.startsWith(value),
  [TemplateUpdateOperator.EndsWith]: (line, value) => line.endsWith(value),
  [TemplateUpdateOperator.Matches]: (line, value) => new RegExp(value).test(line),
  [TemplateUpdateOperator.ContainsWord]: (line, value) => new RegExp(`\\b${value}\\b`).test(line),
  [TemplateUpdateOperator.IsEmpty]: (line) => line.length === 0,
  [TemplateUpdateOperator.IsNotEmpty]: (line) => line.length > 0
};

export const checkCondition = (line: string, when?: [TemplateUpdateOperator, string] | boolean): boolean => {
  try {
    if (when === undefined) {
      return true;
    }

    if (typeof when === 'boolean') {
      return when;
    }

    if (!(when[0] in OPERATOR_FUNCTIONS)) {
      logger.info(`Invalid operator: ${when[0]}`);
      return true;
    }

    // For operators that don't need a value parameter
    if ([TemplateUpdateOperator.IsEmpty, TemplateUpdateOperator.IsNotEmpty].includes(when[0])) {
      return OPERATOR_FUNCTIONS[when[0]](line, '');
    }

    return OPERATOR_FUNCTIONS[when[0]](line, when[1]);
  } catch (e) {
    logger.error('Error in checkCondition() function:', e);
    return true;
  }
};
