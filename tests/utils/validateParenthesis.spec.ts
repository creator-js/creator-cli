import { isValidParenthesis } from '../../src/utils/validParenthesis';

describe('Test isValidParenthesis() function', () => {

  it('should return true (1)', () => {
    expect(isValidParenthesis('test')).toBeTruthy();
  });

  it('should return true (2)', () => {
    expect(isValidParenthesis('(test)')).toBeTruthy();
  });

  it('should return true (3)', () => {
    expect(isValidParenthesis('([test])')).toBeTruthy();
  });

  it('should return true (4)', () => {
    expect(isValidParenthesis('([test]test)')).toBeTruthy();
  });

  it('should return true (5)', () => {
    expect(isValidParenthesis('([test{}]test)')).toBeTruthy();
  });

  it('should return false (1)', () => {
    expect(isValidParenthesis('(test')).toBeFalsy();
  });

  it('should return false (2)', () => {
    expect(isValidParenthesis('(test])')).toBeFalsy();
  });

  it('should return false (3)', () => {
    expect(isValidParenthesis('(test[)')).toBeFalsy();
  });

  it('should return false (4)', () => {
    expect(isValidParenthesis('(test[})')).toBeFalsy();
  });

  it('should return false (5)', () => {
    expect(isValidParenthesis('{test[})')).toBeFalsy();
  });
});
