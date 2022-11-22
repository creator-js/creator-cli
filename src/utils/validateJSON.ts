import { IConfig } from '../types/config.types';

export const validateJSON = (config: IConfig): boolean => {
  // Domain should not have name "variables"
  // No domains with th same name
  // No empty templates
  return true;
};
