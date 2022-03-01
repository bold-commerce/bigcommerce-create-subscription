/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  roots: [
      "<rootDir>"
  ],
  testEnvironment: "node",
  transform: {
      '^.+\\.tsx?$': 'ts-jest'
  },
};