export default ({ successType, actionsName, serviceNamespace }) => {

  const serviceString = `export const ${actionsName} = createAsyncThunk<${successType}>(
  'uar/${actionsName}',
  async (): Promise<${successType}> => {
    return await ${serviceNamespace}.${actionsName}();
  },
);`;

  return {
    init: `import { createAsyncThunk } from '@reduxjs/toolkit';
import { ${serviceNamespace} } from './services';
import { ${successType} } from './types';

${serviceString}
`,
    updates: [
      {
        direction: 'up',
        searchFor: ['includes', ');'],
        changeWith: `);\n\n${serviceString}`
      },
      {
        fromLine: ['includes', './types'],
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `, ${successType} }`,
        when: ['not includes', successType],
      }
    ]
  };
};
