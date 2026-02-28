import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/admin.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) { }

    async create(createDto: any) {
        const userCount = await this.repository.count();
        const hashedPassword = await bcrypt.hash(createDto.password, 10);

        const isFirstUser = userCount === 0;

        const admin = this.repository.create({
            ...createDto,
            password: hashedPassword,
            role: isFirstUser ? 'admin' : (createDto.role || 'user'),
            isApproved: isFirstUser ? true : (createDto.isApproved ?? false),
        });
        return this.repository.save(admin);
    }

    findAll() {
        return this.repository.find();
    }

    findByEmail(email: string) {
        return this.repository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password', 'avatar', 'role', 'isApproved'] // Include password for login
        });
    }

    findById(id: string) {
        return this.repository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'avatar']
        });
    }

    async update(id: string, updateDto: any) {
        const { id: _, ...data } = updateDto;
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        await this.repository.update(id, data);
        return this.repository.findOne({ where: { id } });
    }

    async remove(id: string) {
        return this.repository.delete(id);
    }
}
