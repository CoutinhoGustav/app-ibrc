import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('Aluno')
export class Aluno {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name: string;

    @Column({ default: 'active' })
    status: string; // active, inactive

    @Column({ default: 'official' })
    type: string; // official, honorary

    @Column({ nullable: true })
    turma: string;

    @Column({ name: 'registered_by', nullable: true })
    registeredBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
