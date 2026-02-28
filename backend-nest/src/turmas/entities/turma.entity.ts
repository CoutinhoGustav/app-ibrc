import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Turma')
export class Turma {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    turma: string;

    @Column({ nullable: true })
    professor: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    data: string;

    @Column({ default: 0 })
    presentes: number;

    @Column({ default: 0 })
    ausentes: number;

    @Column({ default: 0 })
    total: number;

    @Column({ nullable: true })
    visitantes: string;

    @Column('jsonb', { name: 'present_students', nullable: true })
    presentStudents: string[];

    @Column('jsonb', { name: 'absent_students', nullable: true })
    absentStudents: string[];

    @Column({ name: 'recorded_by', nullable: true })
    recordedBy: string;
}
