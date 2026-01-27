import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  testTimeout: 10000,
  transform: {
    "^.+\\.ts$": ["ts-jest", { 
      useESM: true,
      tsconfig: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
      },
    }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};