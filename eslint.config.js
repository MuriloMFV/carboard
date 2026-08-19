import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'android/**', 'ios/**', '.edge-*/**'],
  },
  ...tseslint.configs.recommended,
);
