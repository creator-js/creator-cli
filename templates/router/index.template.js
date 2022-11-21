export default ({ componentName, routePath }) => {

  const routeImport = `const ${componentName} = lazy(() => import('../pages/${componentName}'));`;

  const routeDeclaration = `{
        path: '${routePath}',
        element: <${componentName} />,
    },`;

  return {
    init: `import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';

${routeImport}

export const routes: RouteObject[] = [
    ${routeDeclaration}
];
`,
    updates: [
      {
        direction: 'up',
        fromLine: ['includes', 'lazy(() =>'],
        searchFor: ['includes', '));'],
        changeWith: `));\n${routeImport}`
      },
      {
        direction: 'up',
        fromLine: ['includes', '];'],
        searchFor: ['includes', '];'],
        changeWith: `${routeDeclaration}\n];`
      }
    ]
  };
};
