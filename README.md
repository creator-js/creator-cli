# Creator.js
[![npm version](https://badge.fury.io/js/creator-js-cli.svg)](https://badge.fury.io/js/creator-js-cli)

CreatorJS is a tool for automating boilerplate code generation.

[Templates examples](https://github.com/creator-js/creator/tree/main/_templates)

[Config example](https://github.com/creator-js/creator/blob/main/creator.config.js)

## Table of Contents

1. [Installation](#installation)
2. [Configuration and Usage](#configuration-and-usage)
3. [Questions](#questions)
4. [Templates](#templates)
5. [Structure](#structure)
6. [Questions chaining](#questions-chaining)
7. [Miscellaneous](#miscellaneous)

## <a name="installation"></a>Installation

You can install CreatorJS using this npm:

```shell
npm install creator-js-cli --save-dev
```

or yarn:

```shell
yarn add creator-js-cli -D
```

## <a name="configuration-and-usage"></a>Configuration and Usage

Create `creator.config.js` file in the root of your project.
> CreatorJS uses ES Modules. If your `package.json` does not include property `type` or its value is different from `module`, then you should create `creator.config.mjs` file instead.

The minimal configuration looks like this:

```js
export default {
  variables: {
    root: './src'
  },
  domains: [
    {
      name: 'components',
      templates: [
          {
              name: 'component.jsx'
          }
      ]
    }
  ]
};
```

`variables` is a dictionary of any variables that one might want to use in the templates. 
>`root` is the only required variable.

`domains` is an array of objects that contain information about what to create. 

The`name` field represents the name of the domain. When started, the CLI will first ask `What needs to be created?` question and in the list of choices there will be domain names.

The `templates` field represents an array of files that will be created or updated after the developer answers all questions. The only required field is `name` which represents the name of the file. By default, the file will be empty.

Run the CLI with this simple command:
```shell
g
```
or in case of errors:
```shell
./node_modules/.bin/g
```

After running the CLI and answering initial question with `components` option, file `./src/component.jsx` should be created.

## <a name="questions"></a>Questions

Questions can be added to provide more details about how to create files. CreatorJS uses [inquirer.js](https://github.com/SBoudrias/Inquirer.js#readme) to work with questions. 
If you already familiar with [API](https://github.com/SBoudrias/Inquirer.js#questions), that's great. Let's add a simple question to our `components` domain from the minimal config:
```js
export default {
    variables: {
        root: './output'
    },
    domains: [
        {
            name: 'components',
            templates: [
                {
                    name: 'component.jsx'
                }
            ],
            questions: [
                {
                    name: 'componentName',
                    message: 'How to name the component?',
                    type: 'input'
                }
            ]
        },
    ]
};
```
After running the CLI and answering questions, the `answers` object will be created. 

`answers` can be used to:
- conditionally show questions
- conditionally create or update files
- set files names
- populate templates

For example, let's add a dynamic file name to our config:
```js
export default {
  variables: {
    root: './output'
  },
  domains: [
    {
      name: 'components',
      templates: [
        {
          name: (answers) => `${answers.components.componentName}.jsx`
        }
      ],
      questions: [
        {
          name: 'componentName',
          message: 'How to name the component?',
          type: 'input'
        }
      ]
    },
  ]
};
```

After running the CLI and answering questions, the file will be created with a name that you provided when answered a question `How to name the component?`.

`answers` has the following structure:
```js
{
    variables: {
        // variables from creator.config.js variables field
    },
    domain1: {
        // answers for domain 1 questions
    },
    domain2: {
        // answers for domain 2 questions
    },
    // ...
}
```

The structure of answers above is valid everywhere except for `questions`. Inquirers' question is similar, but not the same.

In questions, `answers` structure would represent answers for the particular domain. 
It will not have `filePath` field, but will have system fields, like `_file_1` or `_new-folder_1`.

## <a name="templates"></a>Templates

Templates are `.js` files that define the contents of the files that we want to create or update.

> CreatorJS uses ES Modules. If your `package.json` does not include property `type` or its value is different from `module`, then templates should have `.mjs` extension.

Create a file `./templates/component.js` with this minimal configuration:
```js
export default (answers) => {
  return {
    init: '',
    updates: []
  };
};
```

`init` is a string with the initial content of the file.

`updates` is an array of objects defining how to update the file.

### <a name="template-initialization"></a>Initialization

Let's add some initial structure of the file:
```js
export default (answers) => {
  return {
    init: `import React from 'react';
    
    export const ${answers.components.componentName} = () => {
      return <div/>
    }
    `,
    updates: []
  };
};
```
And also update template in the config file:
```js
export default {
  variables: {
    root: './output'
  },
  domains: [
    {
      name: 'components',
      templates: [
        {
          name: (answers) => `${answers.components.componentName}.jsx`,
          template: '../templates/component.js'
        }
      ],
      questions: [
        {
          name: 'componentName',
          message: 'How to name the component?',
          type: 'input'
        }
      ]
    },
  ]
};
```
> Template path is relative to what is defined in the `root` variable.

After running the CLI and answering questions, if the component was named "Atom" for example,  there will be a file `./src/Atom.jsx` with the contents:
```jsx
import React from 'react';

export const Atom = () => {
  return <div/>;
};
```

### <a name="template-update"></a>Update

To make updates, there is an array of objects that will require a developer to define in a declarative way how exactly to update the file. Each object represents an update.

The minimal configuration for this object looks like this:
```js
// ./templates/component.js
export default (answers) => {
    return {
        init: `import React from 'react'
    
    export const ${answers.components.componentName} = () => {
      return <div/>
    }
    `,
        updates: [
            {
                searchFor: ['includes', 'div'],
                changeWith: 'span'
            }
        ]
    };
};
```

It literally tells CreatorJS to search for the line that `includes` string `div` and change it with `span`.

Running the CLI and answering the questions will modify existing `./src/Atom.js` file:
```js
import React from 'react';

export const Atom = () => {
  return <span/>;
};
```

All fields of update object:

| Name       |             Type              | Required | Description                                                                                                                                          |
|------------|:-----------------------------:|----------|:-----------------------------------------------------------------------------------------------------------------------------------------------------|
| direction  |        'up' or 'down'         | false    | Tells, which way to scan the file. Default is `down`.                                                                                                 |
| fromLine   |      [Operator, string]       | false    | When `direction` is `down` the default value is the first line of the file. When `direction` is `up` the default value is the last line of the file. |
| toLine     |      [Operator, string]       | false    | When `direction` is `down` the default value is the last line of the file. When `direction` is `up` the default value is the first line of the file. |
| searchFor  |      [Operator, string]       | true     | Searches for a line with a `string` within boundaries based on condition.                                                                            |
| changeWith |            string             | true     | A string template that should change the `string` from `searchFor`.                                                                                  |
| when       | [Operator, string] or boolean | false    | AA condition on which the substitution is performed. The condition will be checked against every line within the boundaries.                         |
| fallback   |         update object         | false    | When the update could not be performed, the `fallback` update will be performed if provided.                                                         |

* Operator = `'includes' | 'not includes' | '===' | '!=='`

## <a name="structure"></a>Structure

Structure comes in handy when there is a defined folder structure in the project.
Structure is an object that represents this folder structure.

### <a name="static-structure"></a>Static structure

Let's say we have this folder structure:
```text
components
----shared
----features
----pages
```

In terms of CreatorJS `structure` would look like this:
```js
export default {
    variables: {
        root: './output'
    },
    domains: [
        {
            name: 'components',
            structure: {
                components: {
                    shared: '',
                    features: '',
                    pages: ''
                }
            },
            templates: [
                {
                    name: (answers) => `${answers.components.componentName}.jsx`,
                    template: '../templates/component.template.js'
                }
            ],
            questions: [
                {
                    name: 'componentName',
                    message: 'How to name the component?',
                    type: 'input'
                }
            ]
        },
    ]
};
```

With `structure` provided, before asking questions from `questions` the CLI will walk you through the structure.
`structure` impacts the path where files will be created. For example, if you select `components -> shared`, then the file `Atom.jsx`
will have path `./src/components/shared/Atom.jsx`.

When the value of the field is a string, the `structure` questions terminate, and `questions` questions begin.

### <a name="dynamic-structure"></a>Dynamic structure

There are cases when we want to dynamically create folders. To make the folder dynamic, use `$` prefix.
For example, let's say we want to create features on the run. Add an object to the `features` with a `$feature` field equal to an empty string.

```js
export default {
    variables: {
        root: './output'
    },
    domains: [
        {
            name: 'components',
            structure: {
                components: {
                    shared: '',
                    features: {
                        $feature: ''
                    },
                    pages: ''
                }
            },
            templates: [
                {
                    name: (answers) => `${answers.components.componentName}.jsx`,
                    template: '../templates/component.template.js'
                }
            ],
            questions: [
                {
                    name: 'componentName',
                    message: 'How to name the component?',
                    type: 'input'
                }
            ]
        },
    ]
};
```

Now when you get to the `features` folder, CreatorJS will ask you to create a new folder or select an existing ones. 

> The name after `$` does not impact anything.

## <a name="questions-chaining"></a>Questions chaining

Sometimes you will want to create files from one domain and proceed with another. 
One of examples can be Redux, when you want to create a page and then associate it with the reducer.

To chain domains, use `next` field:
```js
export default {
  variables: {
    root: './output'
  },
  domains: [
    {
      name: 'components',
      templates: [
        // ...
      ],
      questions: [
        // ...
      ],
      next: {
        name: 'redux'
      }
    },
    {
      name: 'redux',
      templates: [
        // ...
      ],
      questions: [
        // ...
      ]
    }
  ]
};
```

All fields of the `next` object:

| Name          |              Type               | Required | Description                                                            |
|---------------|:-------------------------------:|----------|:-----------------------------------------------------------------------|
| name          |          string                 | true     | The name of the next domain.                                           |
| when          | (answers) => boolean OR boolean | false    | Condition for switching to the next domain.                            |
| skipStructure |             boolean             | false    | Flag to skip structure and use `filePath` from the previous domain.    |


Sometimes we want to include domains in chaining, but exclude them from initial questions.   
For that case, there is a field `hidden: boolean`: 

```js
{
      name: 'hiddenDomain',
      hidden: true,
      templates: [
        // ...
      ]
    }
```

## <a name="miscellaneous"></a>Miscellaneous

### <a name="smart-types-import-export"></a>Smart types imports and exports

When working with typescript, you might want to create new interfaces or types and import them into files.
However, there are primitives in JavaScript, which names are reserved. We don't want to end up importing a string or a number.
Also, when creating an array type, we don't want to have brackets `[]` in the interfaces/type or import statement.

CreatorJS solves this task under the hood for you so you don't need to think about complicated conditions in the templates.

For example, if you have in your template:
```ts
`export interface ${type} {}`
```
you can answer the `type` question with something like `number[]` and this template will not be created.
Or if you answer with `ISomething[]`, it will resolve to:
```ts
export interface ISomething {}
```

### <a name="methods"></a>Methods

CreatorJS comes with a few useful methods for making the templates.

| Name                 |                 Type                  | Description                                        |
|----------------------|:-------------------------------------:|:---------------------------------------------------|
| capitalize           |      (str: string) => string          | Make the first letter of the string capital.       |
| getTypeValue         | (type: string) => string OR undefined | Returns the dummy value for the provided type.     |
