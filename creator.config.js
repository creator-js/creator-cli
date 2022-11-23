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
              shared: '',
              features: {
                $feature: ''
              },
              popups: ''
            },
            pages: '',
          }
        }
      },
      templates: [
        {
          name: ({ components: { componentName } }) => `${componentName}/${componentName}.tsx`,
          template: '../_templates/components/component.template.js'
        },
        {
          name: ({ components: { componentName } }) => `${componentName}/${componentName}.less`,
          template: '../_templates/components/styles.template.js'
        },
        {
          name: ({ components: { componentName } }) => `${componentName}/${componentName}.test.tsx`,
          template: '../_templates/components/tests.template.js'
        },
        {
          name: ({ components: { componentName } }) => `${componentName}/index.ts`,
          template: '../_templates/components/index.template.js'
        },
        {
          name: '../router/index.tsx',
          template: '../_templates/router/index.template.js',
          when: ({ components: { filePath } }) => filePath.includes('pages')
        }
      ],
      questions: [
        {
          name: 'componentName',
          message: 'How to name the component?',
          type: 'input'
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
          when: (answers) => Object.values(answers).some((v) => v === 'pages')
        },
        {
          name: 'withReducer',
          message: 'Associate this page with reducer?',
          type: 'confirm',
          default: true,
          when: (answers) => Object.values(answers).some((v) => v === 'pages')
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
          name: ({ redux: { sliceName } }) => `./redux/${sliceName}/slice.ts`,
          template: '../_templates/redux/slice.template.js'
        },
        {
          name: ({ redux: { sliceName } }) => `./redux/${sliceName}/selectors.ts`,
          template: '../_templates/redux/selector.template.js'
        },
        {
          name: ({ redux: { sliceName } }) => `./redux/${sliceName}/thunks.ts`,
          template: '../_templates/redux/thunk.template.js',
          when: ({ redux: { async } }) => async
        },
        {
          name: ({ redux: { sliceName } }) => `./redux/${sliceName}/services.ts`,
          template: '../_templates/redux/service.template.js',
          when: ({ redux: { async } }) => async
        },
        {
          name: () => './redux/reducer.ts',
          template: '../_templates/redux/reducer.template.js'
        },
        {
          name: ({ redux: { sliceName } }) => `./redux/${sliceName}/types.ts`,
          template: '../_templates/redux/types.template.js'
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
