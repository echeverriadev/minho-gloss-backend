import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import mongoose, { type Connection } from 'mongoose';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: 'ok';

  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  database: 'up' | 'down';
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  check(): HealthResponseDto {
    const isConnected = this.connection.readyState === mongoose.ConnectionStates.connected;
    return { status: 'ok', database: isConnected ? 'up' : 'down' };
  }
}
