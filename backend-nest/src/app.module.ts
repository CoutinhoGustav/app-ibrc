import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AlunosModule } from './alunos/alunos.module';
import { AssemblyModule } from './assembly/assembly.module';
import { AttendancesModule } from './attendances/attendances.module';
import { AuthModule } from './auth/auth.module';
import { DevelopersModule } from './developers/developers.module';
import { RegistrosModule } from './registros/registros.module';
import { SystemStatusModule } from './system-status/system-status.module';
import { TurmasModule } from './turmas/turmas.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const url = configService.get<string>('DATABASE_URL');
                return {
                    type: 'postgres',
                    url: url,
                    autoLoadEntities: true,
                    synchronize: false, // Apenas para desenvolvimento
                    ssl: url?.includes('supabase') || url?.includes('neon') || url?.includes('require')
                        ? { rejectUnauthorized: false }
                        : false,
                };
            },
        }),
        AlunosModule,
        TurmasModule,
        DevelopersModule,
        AdminModule,
        RegistrosModule,
        AuthModule,
        AttendancesModule,
        AssemblyModule,
        SystemStatusModule,
    ],
})
export class AppModule { }
