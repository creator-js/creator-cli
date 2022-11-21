export default ({ componentName, componentDetails }) => {

  const hasChildren = componentDetails.includes('children');

  const component = hasChildren ? `<${componentName}> 
<div/>
</${componentName}>` : `<${componentName} />`;

  return {
    init: `import React from 'react';
import { render } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('Test ${componentName} component', () => {

  it('should render ${componentName} component', () => {
    const { container } = render(${component});
  });
 
});
`
  };
};
