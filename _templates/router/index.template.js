export default ({ components: { componentName, componentDetails, routePath } }) => {

  const routeImport = `const ${componentName} = lazy(() => import('../pages/${componentName}'));`;
  const hasOutlet = componentDetails.includes('Outlet');
  const childRoutesChar = hasOutlet ? '/*' : '';
  const path = (routePath + childRoutesChar).replace(/\/\//g, '/');

  const routeDeclaration = `{
        path: '${path}',
        element: <${componentName} />,${hasOutlet ? '\nchildren: []' : ''}
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
