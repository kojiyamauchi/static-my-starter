import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@/(.+)': '<rootDir>/resource/base/$1'
  },
  transform: {
    '^.+\\.(ts)$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  testMatch: ['**/resource/tests/**/*.test.+(ts|js)']
}

export default config
