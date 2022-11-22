export default ({ ComponentName, filePath }) => {

  const isPage = filePath.includes('pages');

  const exportString = isPage ? `export default ${ComponentName};` : `export { ${ComponentName} };`;

  return {
    init: `/* istanbul ignore file */
import { ${ComponentName} } from './${ComponentName}';

${exportString} 
`
  };
};
