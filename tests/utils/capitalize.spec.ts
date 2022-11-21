import { capitalize } from '../../src';

describe('Test capitalize() function', () => {

  it('should return string with first capital letter', () => {
    expect(capitalize('test')).toBe('Test');
  });

});
