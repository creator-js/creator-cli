import {
  IConfig, IConfigVariables
} from './types/config.types';
import {
  getTypeValue, isPrimitiveType, isArrayType
} from './utils/basicTypes';
import { capitalize } from './utils/capitalize';

export {
  getTypeValue,
  capitalize,
  isPrimitiveType,
  isArrayType
};


export interface CreatorConfig extends Omit<IConfig, 'variables'> {
  variables?: IConfigVariables;
}
