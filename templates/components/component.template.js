export default ({ componentName, componentDetails }) => {

  const itemsFromRouterDom = [];
  let routerDomImport = '';
  let dispatchImport = '';
  let useHistory = '';
  let useLocation = '';
  let useParams = '';
  let outlet = '';
  let formImport = '';
  let formTemplate = '';
  let childrenImport = false;
  let hasProps = false;

  const separator = '// -------------------------------------------------------------------------------------------------------------------';

  componentDetails.forEach((o) => {
    if (o === 'props') {
      hasProps = true;
    }

    if (o === 'useDispatch') {
      dispatchImport = 'import { useDispatch } from \'react-redux\';';
    }

    if (o === 'useLocation') {
      useLocation = 'const location = useLocation();';
      itemsFromRouterDom.push('useLocation');
    }

    if (o === 'useNavigate') {
      useHistory = 'const navigate = useNavigate();';
      itemsFromRouterDom.push('useNavigate');
    }

    if (o === 'useParams') {
      useParams = 'const params = useParams<{}>();';
      itemsFromRouterDom.push('useParams');
    }

    if (o === 'Outlet') {
      outlet = '<Outlet/>';
      itemsFromRouterDom.push('Outlet');
    }

    if (o === 'children') {
      childrenImport = true;
      hasProps = true;
    }

    if (o === 'useForm') {
      formImport = 'import { FormProvider, useForm } from \'react-hook-form\';';
      formTemplate = `const form = useForm({
    defaultValues: {},
    // resolver: yupResolver(schema)
  });
  
  const { handleSubmit } = form;
  
  const onSubmit = () => {
    handleSubmit((data: any) => {
      console.log(data);
    }, (errors) => {
      console.log(errors);
    })();
  };
    
  ${separator}
  `;
    }
  });

  if (itemsFromRouterDom.length > 0) {
    routerDomImport = `import { ${itemsFromRouterDom.join(',')} } from 'react-router-dom';`;
  }

  const reactImport = `import React${childrenImport ? ', { ReactNode } ' : ''} from 'react';`;
  const styleImport = `import('./${componentName}.less')`;

  const useDispatch = dispatchImport ? 'const dispatch = useDispatch();' : '';

  const propsString = hasProps || childrenImport ? `{ ${childrenImport ? 'children' : ''} }: IProps` : '';

  const formLayout = formImport ? `<FormProvider { ...form }>
    <></>
</FormProvider>` : '';

  const hooks = [
    useDispatch,
    useLocation,
    useHistory,
    useParams
  ].filter((item) => item !== '').join('\n');

  const imports = [
    reactImport,
    styleImport,
    dispatchImport,
    routerDomImport,
    formImport
  ].filter((item) => item !== '').join('\n');

  const layouts = [formLayout, outlet].filter((item) => item !== '').join('\n');

  return {
    init: `${imports}

${hasProps ? 'interface IProps {' : ''}
${childrenImport ? 'children: ReactNode | ReactNode[];' : ''}
${hasProps ? '}' : ''}

export const ${componentName}: React.FC${hasProps ? '<IProps>' : ''} = (${propsString}) => {
  ${hooks}

  ${separator}
     
  ${formTemplate}

  return (
    <div className='${componentName.toLowerCase()}-component'>
      ${layouts}
    </div>
  );
};`
  };
};
