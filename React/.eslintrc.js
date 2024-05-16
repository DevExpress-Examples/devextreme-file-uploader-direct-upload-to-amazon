module.exports = {
  root: true,
  extends: ['devextreme/spell-check'],
  overrides: [{
    files: ['*.ts', '*.tsx'],
    extends: ['devextreme/react'],
    rules: {
      "space-before-function-paren": [
        "error",
        {
          "anonymous": "never",
          "named": "never",
          "asyncArrow": "always"
        }
      ],
    },
    env: {
      browser: true,
      es2021: true
    },
    parserOptions: {
      project: './tsconfig.json',
      'createDefaultProgram': true,
      'ecmaVersion': 8,
    },
    globals: {
      System: false,
      AmazonGateway: false,
      AmazonFileSystem: false,
    },
    settings: {
      react: {
        createClass: 'createReactClass',
        'pragma': 'React',
        version: '16.2',
        flowVersion: '0.53',
      },
      propWrapperFunctions: [
        'forbidExtraProps',
      ],
    },
  }, {
    files: ['*.test.tsx'],
    extends: ['devextreme/jest']
  }]
};
