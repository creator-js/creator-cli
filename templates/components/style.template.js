export default ({ componentName }) => {
  return {
    init: `.${componentName.toLowerCase()}-component {
}`
  };
};
