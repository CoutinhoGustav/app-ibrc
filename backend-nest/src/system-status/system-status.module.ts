import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemStatusService } from './system-status.service';
import { SystemStatusController } from './system-status.controller';
import { SystemStatus } from './entities/system-status.entity';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [TypeOrmModule.forFeature([SystemStatus]), EventsModule],
    controllers: [SystemStatusController],
    providers: [SystemStatusService],
    exports: [SystemStatusService],
})
export class SystemStatusModule { }
