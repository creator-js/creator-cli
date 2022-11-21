export default ({ ComponentName, routePath }) => {

  const routeImport = `const ${ComponentName} = lazy(() => import('../pages/${ComponentName}'));`;

  const routeDeclaration = `{
        path: '${routePath}',
        element: <${ComponentName} />,
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
