import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Developer')
export class Developer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ name: 'date_of_birth', nullable: true })
    dateOfBirth: string;
}
