import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Aluno } from './entities/aluno.entity';

@Injectable()
export class AlunosService {
    constructor(
        @InjectRepository(Aluno)
        private readonly repository: Repository<Aluno>,
    ) { }

    async create(createDto: any) {
        const name = (createDto.name || createDto.nome)?.trim();
        if (!name) {
            throw new BadRequestException('O nome é obrigatório');
        }

        const existing = await this.repository.findOne({
            where: { name: ILike(name) }
        });

        if (existing) {
            throw new ConflictException('Já existe um membro registrado com este nome.');
        }

        const aluno = this.repository.create({ ...createDto, name });
        return this.repository.save(aluno);
    }

    findAll() {
        return this.repository.find({
            order: { name: 'ASC' }
        });
    }

    findByTurma(turma: string) {
        return this.repository.find({
            where: { turma },
            order: { name: 'ASC' }
        });
    }

    findOne(id: string) {
        return this.repository.findOne({ where: { id } });
    }

    async update(id: string, updateDto: any) {
        await this.repository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: string) {
        const aluno = await this.findOne(id);
        if (aluno) {
            return this.repository.remove(aluno);
        }
    }
}
