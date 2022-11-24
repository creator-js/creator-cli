import {
  capitalize, getTypeValue
} from 'creator-js-cli';

export default ({ redux: { sliceName, fieldName, actionsName, async, successType } }) => {

  const ISlice = `I${capitalize(sliceName)}Slice`;
  const thunkImport = async ? `import { ${actionsName} } from './thunks';` : '';
  const successTypeImport = `import { ${successType} } from './types';`;

  const syncBuilderString = !async ? `\n${actionsName}: (state: ${ISlice}, { payload }: { payload: ${successType}}) => {
      state.${fieldName} = payload;
    },` : '';

  const asyncBuilderString = async ? `\nbuilder.addCase(${actionsName}.fulfilled, (state: ${ISlice}, { payload }) => {
  state.${fieldName} = payload;
});` : '';

  const exportActionsString = !async ? `export const { ${actionsName} } = ${sliceName}Slice.actions;` : '';
  const exportDefaultReducerString = `export default ${sliceName}Slice.reducer;`;

  return {
    init: `import { createSlice } from '@reduxjs/toolkit';
${successTypeImport}
${thunkImport}

export interface ${ISlice} {
  ${fieldName}: ${successType};
}

const initialState: ${ISlice} = {
  ${fieldName}: ${getTypeValue(successType)},
};

export const ${sliceName}Slice = createSlice({
  name: '${sliceName}',
  initialState,
  reducers: {${syncBuilderString}
  },
  extraReducers: (builder) => {${asyncBuilderString}
  },
});

${exportActionsString}
${exportDefaultReducerString}
`,
    updates: [
      {
        fromLine: ['includes', './types'],
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `, ${successType} }`,
        when: ['not includes', successType],
        fallback: {
          searchFor: ['includes', 'toolkit\';'],
          changeWith: `toolkit';\n${successTypeImport}`,
        }
      },
      {
        fromLine: ['includes', './thunks'],
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `, ${actionsName} }`,
        when: ['not includes', actionsName],
        fallback: {
          searchFor: ['includes', 'toolkit\';'],
          changeWith: `toolkit';\n${thunkImport}`,
        }
      },
      {
        fromLine: ['includes', `export interface ${ISlice}`],
        searchFor: ['includes', '}'],
        changeWith: `${fieldName}: ${successType};\n}`
      },
      {
        fromLine: ['includes', 'const initialState'],
        searchFor: ['includes', '};'],
        changeWith: `${fieldName}: ${getTypeValue(successType)},\n}`
      },
      {
        fromLine: ['includes', 'extraReducers'],
        searchFor: ['includes', '{'],
        changeWith: `{\n${asyncBuilderString}`
      },
      {
        fromLine: ['includes', 'reducers'],
        searchFor: ['includes', '{'],
        changeWith: `{\n${syncBuilderString}`
      }
    ]
  };
};
