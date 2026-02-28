import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { User } from './entities/admin.entity';
import { AuthController } from './auth.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AuthController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
// Re-indexed
