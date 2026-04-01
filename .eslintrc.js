module.exports = {
  root: true,
  ignorePatterns: ['src/main/views/govuk/**'],
  env: { browser: true, es6: true, node: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'jest'],
  settings: {
  'import/resolver': {
    alias: {
      map: [
        ['types', './src/main/types'],
        ['router','./src/main/router'],
        ['routes','./src/main/routes'],
        ['modules','./src/main/modules']
   ],
      extensions: ['.ts', '.js']
      }
    },
    node: {
      extensions: ['.ts', '.js'],
      paths: ['src/main']
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' },
  rules: {
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    curly: 'error',
    eqeqeq: 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin', 
          'external',       
          'internal',             
          'parent', 
          'sibling', 
          'index'
        ],

        alphabetize: {
          caseInsensitive: false,
          order: 'asc',
        },
        'newlines-between': 'always',

        pathGroups: [
         {
           pattern: 'types/**',
           group: 'internal',
           position: 'before',
         },
         {
           pattern: '{router,routes,modules}/**',
           group: 'internal',
           position: 'after',
         },
        ]
      },
    ],
    'jest/prefer-to-have-length': 'error',
    'jest/valid-expect': 'off',
    'linebreak-style': 'off',
    'no-console': 'warn',
    'no-prototype-builtins': 'off',
    'no-return-await': 'error',
    'no-unneeded-ternary': [
      'error',
      {
        defaultAssignment: false,
      },
    ],
    'object-curly-spacing': ['error', 'always'],
    'object-shorthand': ['error', 'properties'],
    quotes: [
      'error',
      'single',
      {
        allowTemplateLiterals: false,
        avoidEscape: true,
      },
    ],
    semi: ['error', 'always'],
    'sort-imports': [
      'error',
      {
        allowSeparatedGroups: false,
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
  },
};
