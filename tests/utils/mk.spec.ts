import { normalizePath } from '../../src/utils/mk';

describe('Test mk functions', () => {

  it('should normalizePath path', () => {
    const path = '/path\\with/different\\slashes/';
    const expected = '/path/with/different/slashes/';
    expect(normalizePath(path)).toBe(expected);
  });

});
