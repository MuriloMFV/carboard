import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'android/**',
      'ios/**',
      '.edge-*/**',
      'supabase/.temp/**',
      'supabase/.branches/**',
    ],
  },
  ...tseslint.configs.recommended,
);
