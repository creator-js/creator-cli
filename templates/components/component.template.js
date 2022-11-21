export default ({ ComponentName, ComponentDetails }) => {

  let storeImport = '';
  let routerDomImport = '';
  let useHistory = '';
  let useLocation = '';
  let useParams = '';
  let outlet = '';
  let formImport = '';
  let formTemplate = '';
  let childrenImport = false;

  ComponentDetails.forEach((o) => {
    if (o === 'useDispatch') {
      storeImport = 'import { useDispatch } from \'react-redux\';';
    }

    if (o === 'useLocation') {
      useLocation = '  const location = useLocation();\n';
      routerDomImport = 'useLocation';
    }

    if (o === 'useNavigate') {
      useHistory = '  const navigate = useNavigate();\n';
      routerDomImport += routerDomImport === '' ? 'useNavigate' : ', useNavigate';
    }

    if (o === 'useParams') {
      useParams = '  const params = useParams<{}>();\n';
      routerDomImport += routerDomImport === '' ? 'useParams' : ', useParams';
    }

    if (o === 'Outlet') {
      outlet = '<Outlet/>';
      routerDomImport += routerDomImport === '' ? 'Outlet' : ', Outlet';
    }

    if (o === 'Children') {
      childrenImport = true;
    }

    if (o === 'useFormHook') {
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
    
  // -------------------------------------------------------------------------------------------------------------------
  `;
    }
  });

  if (routerDomImport) {
    routerDomImport = `import { ${routerDomImport} } from 'react-router-dom';\n`;
  }


  return {
    init: `import React${childrenImport ? ', { ReactNode } ' : ''} from 'react';
import './${ComponentName}.less'; 
${storeImport}
${routerDomImport}
${formImport}

interface IProps {
    ${childrenImport ? 'children: ReactNode | ReactNode[];' : ''}
}

export const ${ComponentName}: React.FC<IProps> = ({${childrenImport ? 'children' : ''}}: IProps) => {
  ${storeImport ? 'const dispatch = useDispatch();\n' : ''}${useLocation}${useHistory}${useParams}


  // -------------------------------------------------------------------------------------------------------------------
     
  ${formTemplate}

  return (
    <div className='${ComponentName.toLowerCase()}-component'>
      ${formImport ? `<FormProvider { ...form }>

      </FormProvider>` : ''}${outlet}
    </>
  );
};
  `
  };
};
