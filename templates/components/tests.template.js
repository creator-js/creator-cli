export default ({ ComponentName }) => {

  return {
    init: `import React from 'react';
import { render } from '@testing-library/react';
import { ${ComponentName} } from './${ComponentName}';

describe('Test ${ComponentName} component', () => {

  it('should render ${ComponentName} component', () => {
    const { container } = render(<${ComponentName} />);
  });

});
`
  };
};
