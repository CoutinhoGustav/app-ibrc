import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registro } from './entities/registro.entity';

@Injectable()
export class RegistrosService {
    constructor(
        @InjectRepository(Registro)
        private registrosRepository: Repository<Registro>,
    ) { }

    async findAll(page: number, limit: number) {
        const [data, total] = await this.registrosRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { dataRegistro: 'DESC' }
        });

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id: string) {
        return this.registrosRepository.findOne({ where: { id } });
    }

    async create(data: Partial<Registro>) {
        return this.registrosRepository.save(this.registrosRepository.create(data));
    }

    async update(id: string, data: Partial<Registro>) {
        await this.registrosRepository.update(id, data);
        return this.findById(id);
    }

    async remove(id: string) {
        await this.registrosRepository.delete(id);
    }

    async search(query: string) {
        return this.registrosRepository.createQueryBuilder('registro')
            .where('registro.professorNome ILIKE :query', { query: `%${query}%` })
            .orWhere('registro.turmaName ILIKE :query', { query: `%${query}%` })
            .getMany();
    }
}
