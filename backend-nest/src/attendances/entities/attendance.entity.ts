import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('attendances')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'student_name' })
    studentName: string;

    @Column({ default: 'official' })
    type: string; // official, honorary

    @Column()
    status: string; // present, absent

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column({ name: 'recorded_by', nullable: true })
    recordedBy: string;
}
