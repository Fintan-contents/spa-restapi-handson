import storybook from 'eslint-plugin-storybook';
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import {FlatCompat} from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...storybook.configs['flat/recommended'],
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:prettier/recommended',
  ),
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
];

export default eslintConfig;
