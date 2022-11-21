import { isPrimitiveType } from '../../src';

describe('Test isPrimitiveType() function', () => {

  it('should return true for number', () => {
    expect(isPrimitiveType('number')).toBeTruthy();
  });

  it('should return true for number[]', () => {
    expect(isPrimitiveType('number[]')).toBeTruthy();
  });

  it('should return true for string', () => {
    expect(isPrimitiveType('string')).toBeTruthy();
  });

  it('should return true for string[]', () => {
    expect(isPrimitiveType('string[]')).toBeTruthy();
  });

  it('should return true for boolean', () => {
    expect(isPrimitiveType('boolean')).toBeTruthy();
  });

  it('should return true for boolean[]', () => {
    expect(isPrimitiveType('boolean[]')).toBeTruthy();
  });

  it('should return true for null', () => {
    expect(isPrimitiveType('null')).toBeTruthy();
  });

  it('should return true for null[]', () => {
    expect(isPrimitiveType('null[]')).toBeTruthy();
  });

  it('should return true for undefined', () => {
    expect(isPrimitiveType('undefined')).toBeTruthy();
  });

  it('should return true for undefined[]', () => {
    expect(isPrimitiveType('undefined[]')).toBeTruthy();
  });

  it('should return true for unknown', () => {
    expect(isPrimitiveType('unknown')).toBeTruthy();
  });

  it('should return true for unknown[]', () => {
    expect(isPrimitiveType('unknown[]')).toBeTruthy();
  });

  it('should return true for any', () => {
    expect(isPrimitiveType('any')).toBeTruthy();
  });

  it('should return true for any[]', () => {
    expect(isPrimitiveType('any[]')).toBeTruthy();
  });

  it('should return true for void', () => {
    expect(isPrimitiveType('void')).toBeTruthy();
  });

  it('should return true for void[]', () => {
    expect(isPrimitiveType('void[]')).toBeTruthy();
  });
});
