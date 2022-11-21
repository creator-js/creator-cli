import { TemplateUpdateOperator } from '../../types/config.types';
import { checkCondition } from '../checkCondition';

type T = [TemplateUpdateOperator, string] | boolean | undefined;

describe('Test checkCondition function', () => {

  const line = 'TEST';
  const rightParam = line;
  const wrongParam = 'TOAST';

  it('should return true when no "when" provided', () => {
    const result = checkCondition(line);

    expect(result).toBeTruthy();
  });

  it('should return true when no "when" resolves to "undefined"', () => {
    const when: T = undefined;
    const result = checkCondition(line, when);

    expect(result).toBeTruthy();
  });

  it('should return true when "when" resolves to "true"', () => {
    const when: T = true;
    const result = checkCondition(line, when);

    expect(result).toBeTruthy();
  });

  it('should return false when "when" resolves to "false"', () => {
    const when: T = false;
    const result = checkCondition(line, when);

    expect(result).toBeFalsy();
  });

  it('should return true when line does not include search parameter', () => {
    const when: T = [TemplateUpdateOperator.NotIncludes, wrongParam];
    const result = checkCondition(line, when);

    expect(result).toBeTruthy();
  });

  it('should return false when line does not include search parameter', () => {
    const when: T = [TemplateUpdateOperator.NotIncludes, rightParam];
    const result = checkCondition(line, when);

    expect(result).toBeFalsy();
  });

  it('should return true when line includes right search parameter', () => {
    const when: T = [TemplateUpdateOperator.Includes, rightParam];
    const result = checkCondition(line, when);

    expect(result).toBeTruthy();
  });

  it('should return false when line includes wrong search parameter', () => {
    const when: T = [TemplateUpdateOperator.Includes, wrongParam];
    const result = checkCondition(line, when);

    expect(result).toBeFalsy();
  });

  it('should return true when line is equal to the right search parameter', () => {
    const when: T = [TemplateUpdateOperator.Equal, rightParam];
    const result = checkCondition(line, when);

    expect(result).toBeTruthy();
  });

  it('should return false when line is equal to the wrong search parameter', () => {
    const when: T = [TemplateUpdateOperator.Equal, wrongParam];
    const result = checkCondition(line, when);

    expect(result).toBeFalsy();
  });

  it('should return false when line is not equal to the right search parameter', () => {
    const when: T = [TemplateUpdateOperator.NotEqual, rightParam];
    const result = checkCondition(line, when);

    expect(result).toBeFalsy();
  });

  it('should return true when line is not equal to the wrong search parameter', () => {
    const when: T = [TemplateUpdateOperator.NotEqual, wrongParam];
    const result = checkCondition(line, when);

    expect(result).toBeTruthy();
  });
});
