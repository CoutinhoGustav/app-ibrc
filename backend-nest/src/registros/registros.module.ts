import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registro } from './entities/registro.entity';
import { RegistrosController } from './registros.controller';
import { RegistrosService } from './registros.service';

@Module({
    imports: [TypeOrmModule.forFeature([Registro])],
    controllers: [RegistrosController],
    providers: [RegistrosService],
})
export class RegistrosModule { }
