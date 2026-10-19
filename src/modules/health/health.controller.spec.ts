import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HealthController } from './health.controller.js';

async function createController(readyState: mongoose.ConnectionStates) {
  const moduleRef = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [{ provide: getConnectionToken(), useValue: { readyState } }],
  }).compile();
  return moduleRef.get(HealthController);
}

describe('HealthController', () => {
  it('reporta la base de datos como "up" cuando Mongo está conectado', async () => {
    const controller = await createController(mongoose.ConnectionStates.connected);
    expect(controller.check()).toEqual({ status: 'ok', database: 'up' });
  });

  it('reporta la base de datos como "down" cuando Mongo no está conectado', async () => {
    const controller = await createController(mongoose.ConnectionStates.disconnected);
    expect(controller.check()).toEqual({ status: 'ok', database: 'down' });
  });
});
