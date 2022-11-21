import { isArrayType } from '../../src';

describe('Test isArrayType() function', () => {

  it('should return true if the type is array', () => {
    expect(isArrayType('number[]')).toBeTruthy();
  });

  it('should return false if the type is not array', () => {
    expect(isArrayType('number')).toBeFalsy();
  });

});
