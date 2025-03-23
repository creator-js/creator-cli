export default ({ components: { componentName } }) => {
  return {
    init: `.${componentName.toLowerCase()} {
  /* Add your styles here */
}`
  };
};
