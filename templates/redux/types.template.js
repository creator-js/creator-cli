export default ({ pendingType, successType }) => {
  const pendingTypeString = `export interface ${pendingType} {
}`;
  const successTypeString = `export interface ${successType} {
}`;

  return {
    init: `${pendingTypeString}

${successTypeString}
`,
    updates: [
      {
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `}\n\n${pendingTypeString}`,
        when: ['not includes', pendingType]
      },
      {
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `}\n\n${successTypeString}`,
        when: ['not includes', successType]
      }
    ]
  };
};
