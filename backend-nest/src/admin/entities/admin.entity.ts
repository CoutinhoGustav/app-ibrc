import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('User')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column({ select: false, nullable: true })
    password: string;

    @Column({ type: 'text', nullable: true })
    avatar: string;

    @Column({ default: 'user' })
    role: string; // admin, user

    @Column({ name: 'is_approved', default: false })
    isApproved: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
