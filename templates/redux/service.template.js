export default ({ serviceNamespace, actionsName, pendingType, successType }) => {

  const serviceString = `async ${actionsName}(payload: ${pendingType}): Promise<${successType}> {
    return await fetch('${actionsName}');
  },`;

  return {
    init: `import { ${pendingType}, ${successType} } from './types';

export const ${serviceNamespace} = {
  ${serviceString}
}
`,
    updates: [
      {
        fromLine: ['includes', './types'],
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `, ${pendingType} }`,
        when: ['not includes', pendingType],
      },
      {
        fromLine: ['includes', './types'],
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `, ${successType} }`,
        when: ['not includes', successType],
      },
      {
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `${serviceString}\n\n}`
      }
    ]
  };
};
