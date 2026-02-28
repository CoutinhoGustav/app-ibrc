import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Registro')
export class Registro {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'turma_name', length: 255, nullable: true })
    turmaName: string; // nome da turma ex: "Berçário"

    @Column({ name: 'professor_nome', length: 255, nullable: true })
    professorNome: string;

    @Column({ name: 'data_registro', type: 'date', nullable: true })
    dataRegistro: string; // armazenado como YYYY-MM-DD

    @Column({ default: 0 })
    presentes: number;

    @Column({ default: 0 })
    total: number;

    @Column({ type: 'text', default: '-' })
    visitantes: string;

    @Column({ type: 'jsonb', name: 'present_students', nullable: true })
    presentStudents: any;

    @Column({ type: 'jsonb', name: 'absent_students', nullable: true })
    absentStudents: any;
}
