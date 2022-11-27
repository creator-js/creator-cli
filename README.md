# Creator.js
[![npm version](https://badge.fury.io/js/creator-js-cli.svg)](https://badge.fury.io/js/creator-js-cli)

CreatorJS is a tool for automating boilerplate code creation.

[Documentation](https://creator-js.web.app/docs/introduction)

[Templates examples](https://github.com/creator-js/creator/tree/main/_templates)

[Config example](https://github.com/creator-js/creator/blob/main/creator.config.js)

## Table of Contents

1. [Installation](#installation)
2. [Configuration and Usage](#configuration-and-usage)
3. [Variables](#variables)
4. [Domains](#domains)
5. [Questions](#questions)
6. [Templates](#templates)
7. [Structure](#structure)
8. [Advanced concepts](#advanced-concepts)
9. [Type support](#type-support)

## <a name="installation"></a>Installation

You can install CreatorJS using npm:

```shell
npm install creator-js-cli --save-dev
```

or yarn:

```shell
yarn add creator-js-cli -D
```
___
## <a name="configuration-and-usage"></a>Configuration and Usage

Create `creator.config.js` file in the root of your project.
> CreatorJS uses ES Modules. If your `package.json` does not include property `type` or its value is different from `module`, then you should create `creator.config.mjs` file instead.

The minimal configuration looks like this:

```js
export default {
  domains: [
    {
      name: 'components',
      // Templates are optional, but it does not make sense for this example
      templates: [
          {
              name: 'component.jsx'
          }
      ]
    }
  ]
};
```

Run the CLI with this simple command:
```shell
g
```
or in case of errors:
```shell
./node_modules/.bin/g
```

After running the CLI and answering initial question with `components` option, file `./component.jsx` should be created.
___
## <a name="variables"></a>Variables

`variables` is a dictionary of any variables that you might want to use in the templates.

There is a list of predefined variables.

| Name        | Type      | Description                                                  | Required |
|-------------|:----------|:-------------------------------------------------------------|----------|
| root        | string    | The folder relative to which you want to create files.       | optional |
| createEmpty | boolean   | The flag tells whether to create empty files.                | optional |
| runLinter   | boolean   | The flag tells whether to run ESLint after applying changes. | optional |

After running the CLI and answering questions, all variables can be found in `answers.variables`.
___
## <a name="domains"></a>Domains

### <a name="domains-overview"></a>Overview

`domains` are scopes, within which `questions`, `templates` and `structure` are defined.

Each domain has the following fields:

| Name        | Description                                                                                                                                              | Required |
|:------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| name        | The name of the domain. When started, the CLI will first ask `What needs to be created?` question and in the list of choices there will be domain names. | required |
| questions   | Questions that will be asked in the scope of the domain.                                                                                                 | optional |
| templates   | Files that will be created after answering domains questions.                                                                                            | optional |
| structure   | The folder structure of the part of your application, within which you want to create new files. It does not require full structure replication.         | optional |
| next        | The next domain to be processed after you finish answering questions for the current domain.                                                             | optional |
| hidden      | The flag to hide domain from the initial question.                                                                                                       | optional |




### <a name="domains-chaining"></a>Domains chaining

Sometimes you want to create files from one domain and proceed with another.
One of examples can be Redux, when you want to create a page and then associate it with the reducer.

To chain domains, use `next` field:
```js
export default {
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

The `next` object has the following fields:

| Name          |                 Type                  | Description                                                            | Required |
|---------------|:-------------------------------------:|:-----------------------------------------------------------------------|----------|
| name          |                string                 | The name of the next domain.                                           | required |
| when          | ((answers) => boolean) &#124; boolean | Condition for switching to the next domain.                            | optional |
| skipStructure |                boolean                | Flag to skip structure and use `filePath` from the previous domain.    | optional |


Sometimes you want to include domains in chaining, but exclude them from initial questions.   
For that case, you can hide the domain from the initial question with `hidden` flag:

```js
{
      name: 'hiddenDomain',
      hidden: true,
      questions: [
        // ...
      ]
    }
```
___
## <a name="questions"></a>Questions

### <a name="questions-overview"></a>Overview

Questions can be added to provide more details about how to create files. CreatorJS uses [inquirer.js](https://github.com/SBoudrias/Inquirer.js#readme) to work with questions.
If you already familiar with [API](https://github.com/SBoudrias/Inquirer.js#questions), that's great. Let's add a simple question to our `components` domain:
```js
export default {
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

### <a name="questions-answers"></a>Answers

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

For example, in our scenario `answers` would look like this:
```js
{
    variables: {
        root: './', 
        createEmpty: true
    },
    components: {
        filePath: '.',
        componentName: 'Atom'
    }
}
```

Here `variables` were set to the default values. And answers for the `components` domain were put in the `answers.components`.
There is a `filePath` field, for which we did not specify a question. It is inferred from combining `variables.root` and answers to `structure` questions.

The structure of answers above is valid everywhere except for `questions`.

In questions, `answers` structure would represent answers for the **particular domain**.
It does not have access to other domains or variables. For example, it will have system fields, like `_file_1` or `_new-folder_1`, which are used for dynamic structure.
In the resulting `answers` these fields are changed with `filePath`.
___
## <a name="templates"></a>Templates

### <a name="templates-overview"></a>Overview

Templates are `.js` files that define the contents of the files that we want to create or update.

> CreatorJS uses ES Modules. If your `package.json` does not include property `type` or its value is different from `module`, then templates should have `.mjs` extension.

The minimal configuration for a template file looks like this:
```js
export default (answers) => {
  return {
    init: '',
    updates: []
  };
};
```

`init` is a string with the initial content of the file.

`updates` is an array of special objects that define the updates.

The configuration for the template in `creator.config.js` has these fields:

| Name        |                Type                 | Description                                                                                 | Required |
|-------------|:-----------------------------------:|:--------------------------------------------------------------------------------------------|----------|
| name        |               string                | The name of the file. You can use complex path to the file together with name.              | required |
| template    | ((answers) => string) &#124; string | The path to the template file.                                                              | required |
| when        |  [Operator, string] &#124; boolean  | The condition under which the file will be created or updated.                              | optional |
| createEmpty |               boolean               | The flag tells whether to create empty file. Overrides `variables.createEmpty` if provided. | optional |


### <a name="templates-initialization"></a>Initialization

First, create a file `./templates/component.js` with this initial structure:
```js
// templates/components.js

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
Then update template in the config file:
```js
// creator.config.js

export default {
  domains: [
    {
      name: 'components',
      templates: [
        {
          name: (answers) => `${answers.components.componentName}.jsx`,
          template: './templates/component.js'
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
We substitute the answer to the `componentName` question from the `components` domain to the name of the file and also to the name of the component.

After running the CLI and answering questions, if the component was named "Atom" for example,  there will be a file `./Atom.jsx` with the contents:

```jsx
import React from 'react';

export const Atom = () => {
  return <div/>;
};
```

In the`creator.config.js` file the `name` field of a template is not just a name of the file, but the path to this file.
It is possible to extend path with folder, and they will be created:
```js
name: (answers) => `./need/more/folders/${answers.components.componentName}.jsx`
```
It is also possible to go up the folder structure:
```js
name: (answers) => `../../../${answers.components.componentName}.jsx`
```
Thus, it is not limited to just file name.

### <a name="templates-update"></a>Update

Often we don't only want to create files, but also want to update already existing ones.

To make updates, there is a special array of objects describing in a declarative way how exactly to update the file. Each object represents an update.

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
            // These are two required fields to perform an unpdate
            {
                searchFor: ['includes', 'div'],
                changeWith: 'span'
            }
        ]
    };
};
```

It literally tells CreatorJS to search for the line that `includes` `div` and change it with `span`.

Running the CLI and answering the questions will modify existing `./Atom.js` file:
```js
import React from 'react';

export const Atom = () => {
  return <span/>;
};
```

Update object has the following structure:

| Name       |          Type                     | Description                                                                                                                                          | Required |
|------------|:---------------------------------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| direction  |        'up' &#124; 'down'         | Tells, which way to scan the file. Default is `down`.                                                                                                | optional |
| fromLine   |        [Operator, string]         | When `direction` is `down` the default value is the first line of the file. When `direction` is `up` the default value is the last line of the file. | optional |
| toLine     |        [Operator, string]         | When `direction` is `down` the default value is the last line of the file. When `direction` is `up` the default value is the first line of the file. | optional |
| searchFor  |        [Operator, string]         | Searches for a line with a `string` within bounds based on condition.                                                                                | required |
| changeWith |              string               | A value that should substitute `searchFor`.                                                                                                          | required |
| when       | [Operator, string] &#124; boolean | The condition under which the substitution is performed. The condition will be tested on every line within the bounds.                               | optional |
| fallback   |           update object           | When the update could not be performed, the `fallback` update will be performed if provided.                                                         | optional |

* Operator = `'includes' | 'not includes' | '===' | '!=='`

`direction`, `fromLine` and `toLine` together define the bounds within which the look-up will be performed.
___
## <a name="structure"></a>Structure

### <a name="structure-overview"></a>Overview

Structure comes in handy when there is a defined folder structure in the project.
Structure is an object that represents this folder structure. Within the domain it is not required to provide the full folder structure.
See [Working with different structures](#working-with-different-structures) for more details.

`structure` adds structural questions prior to the user-defined `questions`.

Answers to **structural questions** are not stored in the final `answers`. Instead, they are merged into a field called `filePath`, which you may find under domains' answers.

However, you may see explicit answers to **structural questions** in `questions` `answers`.

For example, let's say we have this question with condition:
```js
// creator.config.js

export default {
    domains: [
        {
            name: 'components',
            structure: {
                components: ''
            },
            questions: [
                {
                    name: 'componentName',
                    message: 'How to name the component?',
                    type: 'input',
                    when: (answers) => // some condition
                }
            ]
        },
    ]
};
```

This `answers` will look like this:
```js
{
  create: 'components',
  _file_1: 'components'
}
```

In questions, `answers` structure would represent answers for the **particular domain**.
It does not have access to other domains or variables. For example, it will have system fields, like `_file_1` or `_new-folder_1`, which are used for dynamic structure.

One more thing to be explicitly mentioned, is that `filePath` is a combination of:

`<variables.root>`/`<structural answers>`/`<template name>`.

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
// creator.config.js

export default {
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
                    template: './templates/component.template.js'
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
will have path `./components/shared/Atom.jsx`.

When the value of the field is a string, the `structure` questions terminate, and the user-defined `questions` questions begin.

### <a name="dynamic-structure"></a>Dynamic structure

There are cases when we want to dynamically create folders. To make the folder dynamic, use `$` prefix.

Let's say we want to create features on the run. Add an object to the `features` with a `$feature` field equal to an empty string.

```js
// creator.config.js

export default {
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
                    template: './templates/component.template.js'
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

Now when you get to the `features` folder, CreatorJS will ask you to create a new folder or select an existing one.

The name after `$` does not impact anything.

### <a name="structural-questions-for-domain-chaining"></a>Structural questions for domain chaining

In the [domains chaining](#domains-chaining) section, we learned that it is possible to merge domains into a single questions flow.

If domains, that we want to merge, contain `structure`, each question set will start with structural questions.

It is possible to pass structural questions answers to the next domain by using `next.skipStructure` flag:

```js
// creator.config.js

export default {
    domains: [
        {
            name: 'components',
            // ...
            next: {
                name: 'redux',
                skipStructure: true
            }
        },
        {
            name: 'redux',
            // ...
        }
    ]
};

```

## <a name="working-with-different-structures"></a>Working with different structures

Different domains can have different structures.

Consider this folder structure:
```text
components
----shared
----features
--------feature-1
--------feature-2
----pages

redux
----reducer-1
----reducer-2
```

It can be represented like this:
```js
// creator.config.js

export default {
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
            // ...
        },
        {
            name: 'components',
            structure: {
                redux: {
                    $reducer: ''
                },
                // ...
            }
        }
    ]
};

```

It is not required to replicate the full folder structure. Create one that is suitable for the particular domain.
___
## <a name="advanced-concepts"></a>Advanced concepts

### Type import and export

When working with typescript, you might want to create new interfaces or types and import them into files.
However, there are primitives in JavaScript, which names are reserved. We don't want to end up importing a string or a number.
Also, when creating an array type, we don't want to have brackets `[]` in the interfaces/type or import statement.

CreatorJS solves this task under the hood for you so you don't need to think about complicated conditions in the templates.

For example, if you have in your template:
```ts
export default (answers) => {
    return {
        init: `export interface ${answers.someDomain.type} {}`
    };
};
```
you can answer the `type` question with something like `number[]` and this template will not be created.
Or if you answer with `ISomething[]`, it will resolve to:
```ts
export interface ISomething {}
```

CreatorJS ignores primitives and array brackets for `export interfaces`, `export type` and `import` statements.

### Built-in methods

CreatorJS comes with a few useful methods for making the templates.

| Name                 |                    Type                     | Description                                        |
|----------------------|:-------------------------------------------:|:---------------------------------------------------|
| capitalize           |          (str: string) => string            | Make the first letter of the string capital.       |
| getTypeValue         | ((type: string) => string) &#124; undefined | Returns the dummy value for the provided type.     |

___
## <a name="type-support"></a>Type support

To support config types, use JSDoc `@type` notation:

```js
/** @type { import('creator-js-cli/dist/index').CreatorConfig } */
const config = {
  // ...
}

export default config;
```
