import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { AlunosService } from '../alunos/alunos.service';
import { SystemStatusService } from '../system-status/system-status.service';
import { AttendancesService } from '../attendances/attendances.service';

@Controller('assembly')
export class AssemblyController {
    constructor(
        private readonly alunosService: AlunosService,
        private readonly systemStatusService: SystemStatusService,
        private readonly attendancesService: AttendancesService,
    ) { }

    @Get('students')
    async findAllStudents() {
        const students = await this.alunosService.findAll();
        return (students || []).map(s => this.mapId(s));
    }

    @Post('students')
    async createStudent(@Body() dto: any) {
        const student: any = await this.alunosService.create(dto);
        return this.mapId(student);
    }

    @Delete('students/:id')
    removeStudent(@Param('id') id: string) {
        return this.alunosService.remove(id);
    }

    @Get('status')
    async getStatus() {
        const status: any = await this.systemStatusService.getStatus();
        return { ...status, _id: status.id };
    }

    @Post('status/toggle')
    async toggleStatus() {
        const status = await this.systemStatusService.getStatus();
        return this.systemStatusService.toggleCall(!status.isCallActive);
    }

    @Post('attendance')
    async createAttendance(@Body('records') records: any[]) {
        const results = [];
        const recordsArray = Array.isArray(records) ? records : [];
        for (const record of recordsArray) {
            const saved: any = await this.attendancesService.create(record);
            results.push(this.mapId(saved));
        }
        return { savedRecords: results };
    }

    @Get('history')
    async getHistory(@Query('date') date?: string) {
        const attendances = await this.attendancesService.findAll(date);
        return (attendances || []).map(a => this.mapId(a));
    }

    @Put('attendance/:id')
    async updateAttendance(@Param('id') id: string, @Body() dto: any) {
        const updated: any = await this.attendancesService.update(id, dto);
        if (!updated) return { message: 'Registro não encontrado' };
        return this.mapId(updated);
    }

    @Delete('attendance/:id')
    async removeAttendance(@Param('id') id: string) {
        return this.attendancesService.remove(id);
    }

    @Delete('history')
    async removeHistoryByDate(@Query('date') date: string) {
        return this.attendancesService.removeByDate(date);
    }

    private mapId(item: any) {
        if (!item) return item;
        return { ...item, _id: item.id };
    }
}
