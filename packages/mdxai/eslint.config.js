import base from '@repo/eslint-config/base.js';

export default [
  ...base,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
