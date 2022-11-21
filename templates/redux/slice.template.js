import {
  capitalize, getTypeValue
} from 'react-generator-cmd';

export default ({ sliceName, fieldName, successType, actionsName }) => {

  const ISlice = `I${capitalize(sliceName)}Slice`;

  const asyncBuilderString = `builder.addCase(${actionsName}.fulfilled, (state: ${ISlice}, { payload }) => {
  state.${fieldName} = payload;
});`;

  return {
    init: `import { createSlice } from '@reduxjs/toolkit';
import { ${successType} } from './types';

import { ${actionsName} } from './thunks';

export interface ${ISlice} {
  ${fieldName}: ${successType};
}

const initialState: ${ISlice} = {
  ${fieldName}: ${getTypeValue(successType)},
};

export const ${sliceName}Slice = createSlice({
  name: '${sliceName}',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    ${asyncBuilderString}
  },
});
`,
    updates: [
      {
        fromLine: ['includes', './types'],
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `, ${successType} }`,
        when: ['not includes', successType],
      },
      {
        fromLine: ['includes', './thunks'],
        direction: 'up',
        searchFor: ['includes', '}'],
        changeWith: `, ${actionsName} }`,
        when: ['not includes', actionsName],
      },
      {
        fromLine: ['includes', `export interface I${sliceName}Slice`],
        searchFor: ['includes', '}'],
        changeWith: `${fieldName}: ${successType};\n}`
      },
      {
        fromLine: ['includes', 'const initialState'],
        searchFor: ['includes', '};'],
        changeWith: `${fieldName}: {},\n}`
      },
      {
        fromLine: ['includes', 'extraReducers'],
        searchFor: ['includes', '});'],
        changeWith: `});\n${asyncBuilderString}`
      }
    ]
  };
};
