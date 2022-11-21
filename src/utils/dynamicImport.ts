export const dynamicImport = (path: string) => {
  path = path.split('\\').join('/');
  return eval(`import('${path}');`);
};
