import GarageDoorStack from "./GarageDoorStack";
import * as sst from "@serverless-stack/resources";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
    architecture: 'arm_64',
    memorySize: 256
  });

  new GarageDoorStack(app, "garage-door-stack");
}
