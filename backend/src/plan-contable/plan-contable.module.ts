import { Module } from '@nestjs/common';
import { PlanContableController } from './plan-contable.controller';
import { PlanContableService } from './plan-contable.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanContableController],
  providers: [PlanContableService],
  exports: [PlanContableService],
})
export class PlanContableModule {}