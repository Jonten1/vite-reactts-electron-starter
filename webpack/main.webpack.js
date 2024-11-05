import { ProvidePlugin } from 'webpack';
import rules from './rules.webpack';

export const resolve = {
  fallback: {
    events: require.resolve('events/')
  },
  extensions: ['.ts', '.tsx', '.js']
};

export const module = {
  rules
};
export const plugins = [
  new ProvidePlugin({
    process: 'process/browser'
  })
];
