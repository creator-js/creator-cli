import { capitalize } from 'creator-js-cli';

export default ({ fieldName, reducerName, sliceName, successType }) => {

  const importSuccessType = `import { ${successType} } from './types';`;

  const selectorString = `export const use${capitalize(fieldName)}Selector = () => {
  return useSelector<RootReduxState, ${successType}>((store: RootReduxState) =>
    store.${reducerName}.${sliceName}.${fieldName});
};`;

  return {
    init: `import { useSelector } from 'react-redux';
import { RootReduxState } from '../reducer';

${importSuccessType}

${selectorString} 
`,
    updates: [
      {
        fromLine: ['includes', './types'],
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `, ${successType} }`,
        when: ['not includes', successType]
      },
      {
        direction: 'up',
        searchFor: ['includes', '};'],
        changeWith: `};\n\n${selectorString}`
      }
    ]
  };
};
