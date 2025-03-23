export default ({ components: { componentName, componentDetails = [], filePath } }) => {
  const isPage = filePath.includes('pages');
  
  // Define imports
  const imports = [
    'import { ReactNode } from \'react\';',
    'import \'./index.css\';',
  ];

  // Collect router-dom imports
  const routerImports = [];
  if (componentDetails.includes('useLocation')) routerImports.push('useLocation');
  if (componentDetails.includes('useParams')) routerImports.push('useParams');
  if (componentDetails.includes('useNavigate')) routerImports.push('useNavigate');
  if (componentDetails.includes('Outlet')) routerImports.push('Outlet');
  if (routerImports.length > 0) {
    imports.push(`import { ${routerImports.join(', ')} } from 'react-router-dom';`);
  }

  // Add other imports
  if (componentDetails.includes('useDispatch')) {
    imports.push('import { useDispatch } from \'react-redux\';');
  }
  if (componentDetails.includes('useForm')) {
    imports.push('import { useForm } from \'react-hook-form\';');
  }

  // Define props interface (skip for pages, only add if 'props' or 'children' present)
  let propsInterface = '';
  const hasProps = componentDetails.includes('props');
  const hasChildren = componentDetails.includes('children');
  if (!isPage && (hasProps || hasChildren)) {
    if (hasProps && hasChildren) {
      propsInterface = `type IProps = {
  // Add your props here
  children: ReactNode;
}`;
    } else if (hasProps) {
      propsInterface = `type IProps = {
  // Add your props here
}`;
    } else if (hasChildren) {
      propsInterface = `type IProps = {
  children: ReactNode;
}`;
    }
  }

  // Add hook declarations
  const hooks = [];
  if (componentDetails.includes('useDispatch')) hooks.push('const dispatch = useDispatch();');
  if (componentDetails.includes('useLocation')) hooks.push('const location = useLocation();');
  if (componentDetails.includes('useParams')) hooks.push('const params = useParams();');
  if (componentDetails.includes('useNavigate')) hooks.push('const navigate = useNavigate();');
  if (componentDetails.includes('useForm')) {
    hooks.push('const { register, handleSubmit, formState: { errors } } = useForm();');
  }

  // Add children prop and Outlet
  const childrenProp = hasChildren ? 'children' : '';
  const outlet = componentDetails.includes('Outlet') ? '<Outlet />' : '';
  const content = [outlet, childrenProp ? `{${childrenProp}}` : ''].filter(Boolean);

  // Props string (empty for pages, adjust for props or children)
  const propsString = isPage 
    ? '()' 
    : childrenProp || propsInterface 
      ? `({ ${childrenProp} }${propsInterface ? ': IProps' : ''})` 
      : '()';

  return {
    init: `${imports.join('\n')}${propsInterface ? '\n\n' + propsInterface : ''}

const ${componentName} = ${propsString} => {
  ${hooks.join('\n  ')}

  return (
    <div className="${componentName.toLowerCase()}">
      ${content.join('\n      ') || '// Component content goes here'}
    </div>
  );
};

${isPage ? `export default ${componentName};` : `export { ${componentName} };`}
`
  };
};