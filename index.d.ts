import {
  IConfig, IConfigVariables
} from './src/types/config.types';

export interface Config extends Omit<IConfig, 'variables'> {
    variables?: IConfigVariables;
}
