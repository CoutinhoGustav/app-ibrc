import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../alunos/entities/aluno.entity';
import { Turma } from './entities/turma.entity';

@Injectable()
export class TurmasService {
    constructor(
        @InjectRepository(Turma)
        private readonly repository: Repository<Turma>,
        @InjectRepository(Aluno)
        private readonly alumnosRepository: Repository<Aluno>,
    ) { }

    async create(createDto: any) {
        const record = this.repository.create(createDto);
        return this.repository.save(record);
    }

    async findAll() {
        const TURMAS_PADRAO = [
            'Berçário',
            'Maternal',
            'Primários',
            'Principiantes',
            'Juniores',
            'Intermediários',
            'Jovens',
            'Adultos',
        ];

        // Collect class names from Aluno table
        const alunoTurmas = await this.alumnosRepository.createQueryBuilder('aluno')
            .select('DISTINCT aluno.turma', 'name')
            .getRawMany();

        // Collect class names from Turma table (which stores the records)
        const registroTurmas = await this.repository.createQueryBuilder('t')
            .select('DISTINCT t.turma', 'name')
            .getRawMany();

        // Merge and clean up
        const allNames = new Set<string>(TURMAS_PADRAO);
        alunoTurmas.forEach(t => {
            if (t.name) allNames.add(t.name);
        });
        registroTurmas.forEach(t => {
            if (t.name) allNames.add(t.name);
        });

        return Array.from(allNames).map(name => ({
            id: name,
            name: name
        }));
    }

    async findAlunosByTurma(turmaName: string) {
        if (turmaName === 'Sem Turma') {
            return this.alumnosRepository.createQueryBuilder('aluno')
                .where('aluno.turma IS NULL OR aluno.turma = :empty', { empty: '' })
                .orderBy('aluno.name', 'ASC')
                .getMany();
        }
        return this.alumnosRepository.find({
            where: { turma: turmaName },
            order: { name: 'ASC' }
        });
    }

    async createInTurma(turmaName: string, dto: any) {
        const aluno = this.alumnosRepository.create({
            ...dto,
            name: (dto.name || dto.nome)?.trim(),
            turma: turmaName === 'Sem Turma' ? null : turmaName
        });
        return this.alumnosRepository.save(aluno);
    }

    findOne(id: string) {
        return this.repository.findOne({ where: { id } });
    }

    async update(id: string, updateDto: any) {
        await this.repository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: string) {
        const record = await this.findOne(id);
        if (record) {
            return this.repository.remove(record);
        }
    }
}
