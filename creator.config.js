export default {
  'variables': {
    'root': './output'
  },
  'domains': [
    {
      'name': 'service',
      'structure': {
        'services1': {
          'serviceFolder1': '',
          'serviceFolder2': {
            ':id': {
              ':id': ''
            }
          },
        },
        'services2': ''
      },
      'questions': [
        {
          'name': 'actionsName',
          'message': 'How to name the service?',
          'type': 'input',
        }
      ],
      'templates': [
        {
          'name': ({ actionsName }) => `./${actionsName}.ts`,
          'template': '../templates/redux/service.template.js'
        }
      ],
      'next': {
        'name': 'types'
      }
    },
    {
      'name': 'types',
      'structure': {
        'services': {
          ':serviceFolder': ''
        }
      },
      'questions': [
        {
          'name': 'successType',
          'message': 'How to name response type?',
          'type': 'input',
        }
      ],
      'templates': [
        {
          'name': ({ successType }) => `./${successType}.ts`,
          'template': '../templates/redux/types.template.js'
        }
      ]
    },
    {
      'name': 'component',
      'structure': {
        'applications': {
          ':appId': {
            'components': {
              'shared': '',
              'features': {
                ':id': ''
              },
              'popups': ''
            },
            'pages': '',
          }
        }
      },
      'templates': [
        {
          'name': ({ componentName }) => `${componentName}/${componentName}.tsx`,
          'template': '../templates/components/component.template.js'
        },
        {
          'name': ({ componentName }) => `${componentName}/${componentName}.less`,
          'template': '../templates/components/style.template.js'
        },
        {
          'name': ({ componentName }) => `${componentName}/${componentName}.test.tsx`,
          'template': '../templates/components/tests.template.js'
        },
        {
          'name': ({ componentName }) => `${componentName}/index.ts`,
          'template': '../templates/components/index.template.js'
        },
        {
          'name': '../router/index.tsx',
          'template': '../templates/router/index.template.js',
          'when': ({ $createPath }) => $createPath.includes('pages')
        }
      ],
      'questions': [
        {
          'name': 'componentName',
          'message': 'How to name the component?',
          'type': 'input'
        },
        {
          'name': 'componentDetails',
          'message': 'What to add to the component?',
          'type': 'checkbox',
          'choices': [
            {
              'name': 'props'
            },
            {
              'name': 'children'
            },
            {
              'name': 'useDispatch'
            },
            {
              'name': 'useLocation'
            },
            {
              'name': 'useParams'
            },
            {
              'name': 'useNavigate'
            },
            {
              'name': 'useForm'
            },
            {
              'name': 'Outlet'
            }
          ]
        },
        {
          'name': 'routePath',
          'message': 'What route?',
          'type': 'input',
          'validate': (input) => input !== '',
          'when': (answers) => Object.values(answers).some((v) => v === 'pages')
        }
      ]
    },
    {
      'name': 'redux',
      'structure': {
        'applications': {
          ':appId': {
            'pages': {
              ':page': ''
            }
          }
        }
      },
      'templates': [
        {
          'name': ({ sliceName }) => `./redux/${sliceName}/slice.ts`,
          'template': '../templates/redux/slice.template.js'
        },
        {
          'name': ({ sliceName }) => `./redux/${sliceName}/selectors.ts`,
          'template': '../templates/redux/selector.template.js'
        },
        {
          'name': ({ sliceName }) => `./redux/${sliceName}/thunks.ts`,
          'template': '../templates/redux/thunk.template.js',
          'when': (answers) => answers.async === true
        },
        {
          'name': ({ sliceName }) => `/redux/${sliceName}/types.ts`,
          'template': '../templates/redux/types.template.js'
        },
        {
          'name': ({ sliceName }) => `./redux/${sliceName}/services.ts`,
          'template': '../templates/redux/service.template.js',
          'when': (answers) => answers.async === true
        },
        {
          'name': () => './redux/reducer.ts',
          'template': '../templates/redux/reducer.template.js'
        }
      ],
      'questions': [
        {
          'name': 'reducerName',
          'message': 'How to name reducer?',
          'type': 'input'
        },
        {
          'name': 'sliceName',
          'message': 'How to name slice?',
          'type': 'input'
        },
        {
          'name': 'async',
          'message': 'Is action async?',
          'type': 'confirm'
        },
        {
          'name': 'fieldName',
          'message': 'How to name field?',
          'type': 'input'
        },
        {
          'name': 'actionsName',
          'message': 'How to name actions?',
          'type': 'input'
        },
        {
          'name': 'serviceNamespace',
          'message': 'What service namespace?',
          'type': 'input',
          'when': (answers) => answers.async === true
        },
        {
          'name': 'pendingType',
          'message': 'Payload type?',
          'type': 'input',
          'default': 'void',
          'when': (answers) => answers.async === true
        },
        {
          'name': 'successType',
          'message': 'Response type',
          'type': 'input',
          'default': 'void'
        }
      ]
    }
  ]
};
