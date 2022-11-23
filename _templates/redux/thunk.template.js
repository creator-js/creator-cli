export default ({ redux: { actionsName, serviceNamespace, successType } }) => {

  const serviceString = `export const ${actionsName} = createAsyncThunk<${successType}>(
  'uar/${actionsName}',
  async (): Promise<${successType}> => {
    return await ${serviceNamespace}.${actionsName}();
  },
);`;

  const importSuccessType = `import { ${successType} } from './types';`;

  return {
    init: `import { createAsyncThunk } from '@reduxjs/toolkit';
import { ${serviceNamespace} } from './services';
${importSuccessType}

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
        fallback: {
          searchFor: ['includes', 'toolkit\';'],
          changeWith: `toolkit';\n${importSuccessType}`
        }
      }
    ]
  };
};
