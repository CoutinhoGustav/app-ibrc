import { Module } from '@nestjs/common';
import { AssemblyController } from './assembly.controller';
import { AlunosModule } from '../alunos/alunos.module';
import { SystemStatusModule } from '../system-status/system-status.module';
import { AttendancesModule } from '../attendances/attendances.module';

@Module({
    imports: [AlunosModule, SystemStatusModule, AttendancesModule],
    controllers: [AssemblyController],
})
export class AssemblyModule { }
