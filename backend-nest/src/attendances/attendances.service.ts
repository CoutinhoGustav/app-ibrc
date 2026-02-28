import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendancesService {
    constructor(
        @InjectRepository(Attendance)
        private readonly repository: Repository<Attendance>,
    ) { }

    async create(createDto: any) {
        // Início e fim do dia para evitar duplicatas na mesma data
        const baseDate = createDto.date ? new Date(createDto.date) : new Date();
        const start = new Date(baseDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(baseDate);
        end.setHours(23, 59, 59, 999);

        // Tenta encontrar um registro existente para o mesmo aluno hoje
        const existing = await this.repository.findOne({
            where: {
                studentName: createDto.studentName,
                date: Between(start, end)
            }
        });

        if (existing) {
            // Se já existe, atualiza o status e quem registrou
            existing.status = createDto.status;
            if (createDto.recordedBy) existing.recordedBy = createDto.recordedBy;
            if (createDto.date) existing.date = new Date(createDto.date);
            return this.repository.save(existing);
        }

        const attendance = this.repository.create(createDto);
        return this.repository.save(attendance);
    }

    findAll(date?: string) {
        const order: any = { date: 'DESC', studentName: 'ASC' };

        if (date) {
            // Se date for YYYY-MM-DD (vindo do filtro do frontend)
            const start = new Date(date + 'T00:00:00');
            const end = new Date(date + 'T23:59:59');

            return this.repository.find({
                where: {
                    date: Between(start, end)
                },
                order
            });
        }
        return this.repository.find({ order });
    }

    findOne(id: string) {
        return this.repository.findOne({ where: { id } });
    }

    async update(id: string, updateDto: any) {
        await this.repository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: string) {
        const attendance = await this.findOne(id);
        if (attendance) {
            return this.repository.remove(attendance);
        }
    }

    async removeByDate(date: string) {
        const start = new Date(date + 'T00:00:00');
        const end = new Date(date + 'T23:59:59');
        const records = await this.repository.find({
            where: {
                date: Between(start, end)
            }
        });
        if (records.length > 0) {
            return this.repository.remove(records);
        }
        return { message: 'Nenhum registro encontrado para esta data' };
    }
}
