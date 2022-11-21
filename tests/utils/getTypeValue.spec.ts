import { getTypeValue } from '../../src';

describe('Test getTypeValue() function', () => {

  it('should return 1', () => {
    expect(getTypeValue('number')).toBe('1');
  });

  it('should return ""', () => {
    expect(getTypeValue('string')).toBe('\'Test\'');
  });

  it('should return true (boolean)', () => {
    expect(getTypeValue('boolean')).toBe('true');
  });

  it('should return true (any)', () => {
    expect(getTypeValue('any')).toBe('true');
  });

  it('should return null', () => {
    expect(getTypeValue('null')).toBe('null');
  });

  it('should return undefined (undefined)', () => {
    expect(getTypeValue('undefined')).toBe('undefined');
  });

  it('should return undefined (void)', () => {
    expect(getTypeValue('void')).toBe('undefined');
  });

  it('should return undefined (empty string)', () => {
    expect(getTypeValue('')).toBe('undefined');
  });

  it('should return []', () => {
    expect(getTypeValue('number[]')).toBe('[]');
  });
});
