import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turma } from '../turmas/entities/turma.entity';

@Injectable()
export class RegistrosService {
    constructor(
        @InjectRepository(Turma)
        private registrosRepository: Repository<Turma>,
    ) { }

    async findAll(page: number, limit: number) {
        const [data, total] = await this.registrosRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { data: 'DESC' }
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

    async create(data: Partial<Turma>) {
        // Mapeia campos do DTO para a entidade se necessário (compatibilidade frontend)
        const mappedData: any = { ...data };
        if (data['turmaName']) mappedData.turma = data['turmaName'];
        if (data['professorNome']) mappedData.professor = data['professorNome'];
        if (data['dataRegistro']) mappedData.data = data['dataRegistro'];

        return this.registrosRepository.save(this.registrosRepository.create(mappedData));
    }

    async update(id: string, data: Partial<Turma>) {
        const mappedData: any = { ...data };
        if (data['turmaName']) mappedData.turma = data['turmaName'];
        if (data['professorNome']) mappedData.professor = data['professorNome'];
        if (data['dataRegistro']) mappedData.data = data['dataRegistro'];

        await this.registrosRepository.update(id, mappedData);
        return this.findById(id);
    }

    async remove(id: string) {
        await this.registrosRepository.delete(id);
    }

    async search(query: string) {
        return this.registrosRepository.createQueryBuilder('turma')
            .where('turma.professor ILIKE :query', { query: `%${query}%` })
            .orWhere('turma.turma ILIKE :query', { query: `%${query}%` })
            .getMany();
    }
}
