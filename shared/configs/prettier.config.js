module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.php',
      options: {
        parser: 'php',
        printWidth: 120,
        tabWidth: 4
      }
    },
    {
      files: ['*.json', '*.yml', '*.yaml'],
      options: {
        tabWidth: 2
      }
    }
  ]
};
