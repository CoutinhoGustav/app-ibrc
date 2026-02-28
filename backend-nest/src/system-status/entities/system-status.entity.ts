import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('system_status')
export class SystemStatus {
    @PrimaryColumn({ default: 'main' })
    id: string;

    @Column({ name: 'is_call_active', default: false })
    isCallActive: boolean;
}
