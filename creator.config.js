export default {
  variables: {
    root: './output',
    createEmpty: true,
  },
  domains: [
    {
      name: 'components',
      structure: {
        applications: {
          $app: {
            components: {
              isLeaf: true,
              createFolder: true
            },
            pages: {
              $page: {
                index: {
                  isLeaf: true,
                  createFolder: false
                },
                components: {
                  isLeaf: true,
                  createFolder: true
                }
              }
            }
          }
        }
      },
      templates: [
        {
          name: ({ components: { componentName, createFolder } }) => createFolder ? `${componentName}/index.tsx` : 'index.tsx',
          template: '../_templates/components/component.template.js'
        },
        {
          name: ({ components: { componentName, createFolder } }) => createFolder ? `${componentName}/index.css` : 'index.css',
          template: '../_templates/components/styles.template.js'
        },
        {
          name: ({ components: { componentName, createFolder } }) => createFolder ? `${componentName}/index.test.tsx` : 'index.test.tsx',
          template: '../_templates/components/tests.template.js'
        },
        {
          name: '../../router/index.tsx',
          template: '../_templates/router/index.template.js',
          when: ({ components: { filePath } }) => filePath.includes('pages') && !filePath.includes('components')
        }
      ],
      questions: [
        {
          name: 'componentName',
          message: 'How to name the component?',
          type: 'input',
          validate: (input) => input !== '',
          when: (answers) => {
            const values = Object.values(answers);
            
            if (values.includes('pages') && values.includes('index')) {
              return false;
            };

            return true;
          }
        },
        {
          name: 'componentDetails',
          message: 'What to add to the component?',
          type: 'checkbox',
          choices: [
            {
              name: 'props'
            },
            {
              name: 'children'
            },
            {
              name: 'useDispatch'
            },
            {
              name: 'useLocation'
            },
            {
              name: 'useParams'
            },
            {
              name: 'useNavigate'
            },
            {
              name: 'useForm'
            },
            {
              name: 'Outlet'
            }
          ]
        },
        {
          name: 'routePath',
          message: 'What route?',
          type: 'input',
          validate: (input) => input !== '',
          when: (answers) => {
            const values = Object.values(answers);
            return values.includes("pages") && values.includes('index');
          }
        },
        {
          name: 'withReducer',
          message: 'Associate this page with reducer?',
          type: 'confirm',
          default: true,
          when: (answers) => {
            const values = Object.values(answers);
            return values.includes("pages") && values.includes('index');
          }
        }
      ],
      next: {
        name: 'redux',
        skipStructure: true,
        when: ({ components: { withReducer } }) => withReducer
      }
    },
    {
      name: 'redux',
      structure: {
        applications: {
          $app: {
            pages: {
              $page: ''
            }
          }
        }
      },
      templates: [
        {
          name: ({ components, redux: { sliceName } }) => {
            const prefix = components ? `/${components.componentName}` : '';
            return `.${prefix}/redux/${sliceName}/slice.ts`;
          },
          template: '../_templates/redux/slice.template.js'
        },
        {
          name: ({ components, redux: { sliceName } }) => {
            const prefix = components ? `/${components.componentName}` : '';
            return `.${prefix}/redux/${sliceName}/selectors.ts`;
          },
          template: '../_templates/redux/selector.template.js'
        },
        {
          name: ({ components, redux: { sliceName } }) => {
            const prefix = components ? `/${components.componentName}` : '';
            return `.${prefix}/redux/${sliceName}/thunks.ts`;
          },
          template: '../_templates/redux/thunk.template.js',
          when: ({ redux: { async } }) => async
        },
        {
          name: ({ components, redux: { sliceName } }) => {
            const prefix = components ? `/${components.componentName}` : '';
            return `.${prefix}/redux/${sliceName}/services.ts`;
          },
          template: '../_templates/redux/service.template.js',
          when: ({ redux: { async } }) => async
        },
        {
          name: ({ components, redux: { sliceName } }) => {
            const prefix = components ? `/${components.componentName}` : '';
            return `.${prefix}/redux/${sliceName}/types.ts`;
          },
          template: '../_templates/redux/types.template.js'
        },
        {
          name: ({ components }) => {
            const prefix = components ? `/${components.componentName}` : '';
            return `.${prefix}/redux/reducer.ts`;
          },
          template: '../_templates/redux/reducer.template.js'
        }
      ],
      questions: [
        {
          name: 'reducerName',
          message: 'How to name reducer?',
          type: 'input'
        },
        {
          name: 'sliceName',
          message: 'How to name slice?',
          type: 'input'
        },
        {
          name: 'fieldName',
          message: 'How to name field?',
          type: 'input'
        },
        {
          name: 'async',
          message: 'Is action async?',
          type: 'confirm'
        },
        {
          name: 'actionsName',
          message: 'How to name actions?',
          type: 'input'
        },
        {
          name: 'serviceNamespace',
          message: 'What service namespace?',
          type: 'input',
          when: (answers) => answers.async
        },
        {
          name: 'pendingType',
          message: 'Payload type?',
          type: 'input',
          default: 'void',
          when: (answers) => answers.async
        },
        {
          name: 'successType',
          message: 'Response type',
          type: 'input',
          default: 'void'
        }
      ]
    }
  ]
};
