import {
  IConfig, IConfigVariables
} from './src/types/config.types';

export as namespace Creator;

export = Config;

declare interface Config extends IConfig {
    variables?: IConfigVariables;
}
