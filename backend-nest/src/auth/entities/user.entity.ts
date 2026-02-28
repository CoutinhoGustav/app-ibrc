import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('User')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, nullable: true })
    name: string;

    @Column({ length: 255, unique: true, nullable: true })
    email: string;

    @Column({ length: 255, nullable: true })
    password: string;

    @Column({ type: 'text', default: 'https://ui-avatars.com/api/?name=Admin+IBRC' })
    avatar: string;

    @Column({ length: 50, default: 'user' })
    role: string;

    @Column({ name: 'is_approved', default: false })
    isApproved: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;
}
