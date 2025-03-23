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

  describe('Performance tests', () => {
    it('should handle empty string efficiently', () => {
      expect(isValidParenthesis('')).toBeTruthy();
    });

    it('should handle odd-length strings efficiently', () => {
      expect(isValidParenthesis('(')).toBeFalsy();
      expect(isValidParenthesis(')')).toBeFalsy();
      expect(isValidParenthesis('({[')).toBeFalsy();
    });

    it('should handle large strings efficiently', () => {
      const largeString = '('.repeat(10000) + ')'.repeat(10000);
      expect(isValidParenthesis(largeString)).toBeTruthy();
    });

    it('should handle deeply nested structures efficiently', () => {
      const nestedString = '('.repeat(1000) + 'test' + ')'.repeat(1000);
      expect(isValidParenthesis(nestedString)).toBeTruthy();
    });

    it('should handle strings with many non-bracket characters efficiently', () => {
      const text = 'test'.repeat(1000);
      expect(isValidParenthesis(text)).toBeTruthy();
    });

    it('should fail fast on invalid input', () => {
      const invalidString = '([{test}])}';
      expect(isValidParenthesis(invalidString)).toBeFalsy();
    });
  });
});
