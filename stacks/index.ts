import { GarageDoorStack } from './GarageDoorStack';
import { App } from '@serverless-stack/resources';

export default function main(app: App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs14.x',
    architecture: 'arm_64',
    memorySize: 256,
  });

  app.stack(GarageDoorStack, { id: 'garage-door-stack' });
}
