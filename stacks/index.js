"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GarageDoorStack_1 = __importDefault(require("./GarageDoorStack"));
function main(app) {
    // Set default runtime for all functions
    app.setDefaultFunctionProps({
        runtime: "nodejs14.x",
        architecture: 'arm_64',
        memorySize: 256
    });
    new GarageDoorStack_1.default(app, "garage-door-stack");
}
exports.default = main;
