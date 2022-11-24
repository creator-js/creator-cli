export default ({ redux: { sliceName, reducerName } }) => {

  const importSliceString = `import { ${sliceName}Slice } from './${sliceName}/slice';`;
  const sliceString = `[${sliceName}Slice.name]: ${sliceName}Slice.reducer,`;
  const reducerString = `${reducerName}: ReturnType<typeof reducer>;`;

  return {
    init: `import { combineReducers } from 'redux';

${importSliceString}

export const reducer = combineReducers({
  ${sliceString}
});

export type RootReduxState = {
  ${reducerString}
};
`,
    updates: [
      {
        searchFor: ['includes', 'slice\';'],
        changeWith: `slice';\n${importSliceString}`,
        when: ['not includes', sliceString],
      },
      {
        fromLine: ['includes', 'combineReducers'],
        searchFor: ['includes', '});'],
        changeWith: `${sliceString}\n});`,
        when: ['not includes', sliceString],

      },
      {
        fromLine: ['includes', 'export type RootReduxState'],
        searchFor: ['includes', '};'],
        changeWith: `${reducerString}\n};`,
        when: ['not includes', reducerString],
      }
    ]
  };
};
