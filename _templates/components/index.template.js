export default ({ components: { componentName, filePath } }) => {

  const isPage = filePath.includes('pages');

  const exportString = isPage ? `export default ${componentName};` : `export { ${componentName} };`;

  return {
    init: `/* istanbul ignore file */
import { ${componentName} } from './${componentName}';

${exportString} 
`
  };
};
