import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turma } from '../turmas/entities/turma.entity';
import { RegistrosController } from './registros.controller';
import { RegistrosService } from './registros.service';

@Module({
    imports: [TypeOrmModule.forFeature([Turma])],
    controllers: [RegistrosController],
    providers: [RegistrosService],
})
export class RegistrosModule { }
