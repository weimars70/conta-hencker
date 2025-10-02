import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AccesosService } from './accesos.service';
import { AccesosController } from './accesos.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AccesosController],
  providers: [AccesosService],
  exports: [AccesosService],
})
export class AccesosModule {}