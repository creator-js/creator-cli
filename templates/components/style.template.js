export default ({ ComponentName }) => {
  return {
    init: `.${ComponentName.toLowerCase()}-component {
}`
  };
};
