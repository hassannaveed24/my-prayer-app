module.exports = {
  root: true,
  extends: 'universe/native',
  rules: {
    'no-unused-vars': ['warn'],
    'import/order': ['off'],
    'import/namespace': ['off'],
    'prettier/prettier': ['error', {}],
  },
};
