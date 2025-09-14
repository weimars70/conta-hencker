import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('test-connection')
  async testConnection() {
    await this.databaseService.testConnection();
    return { message: 'Database connection tested successfully' };
  }
}