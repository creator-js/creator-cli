export default ({ redux: { serviceNamespace, actionsName, pendingType, successType } }) => {

  const serviceString = `async ${actionsName}(payload: ${pendingType}): Promise<${successType}> {
    return await fetch('${actionsName}');
  },`;

  const importTypes = `import { ${pendingType}, ${successType} } from './types';`;

  return {
    init: ` // [Import Types]
${importTypes}

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
        fallback: {
          searchFor: ['includes', '[Import Types]'],
          changeWith: `[Import Types]\nimport { ${pendingType} } from './types';`
        }
      },
      {
        fromLine: ['includes', './types'],
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `, ${successType} }`,
        when: ['not includes', successType],
        fallback: {
          searchFor: ['includes', '[Import Types]'],
          changeWith: `[Import Types]\nimport { ${successType} } from './types';`
        }
      },
      {
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `${serviceString}\n\n}`
      }
    ]
  };
};
