import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Developer } from './entities/developer.entity';

@Injectable()
export class DevelopersService {
    constructor(
        @InjectRepository(Developer)
        private readonly repository: Repository<Developer>,
    ) { }

    create(createDto: any) {
        const dev = this.repository.create(createDto);
        return this.repository.save(dev);
    }

    findAll() {
        return this.repository.find();
    }

    findOne(id: string) {
        return this.repository.findOne({ where: { id } });
    }

    async update(id: string, updateDto: any) {
        await this.repository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: string) {
        const dev = await this.findOne(id);
        if (dev) {
            return this.repository.remove(dev);
        }
    }
}
