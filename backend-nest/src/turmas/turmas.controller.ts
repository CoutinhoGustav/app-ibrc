import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { TurmasService } from './turmas.service';

@Controller('turmas')
export class TurmasController {
    constructor(private readonly service: TurmasService) { }

    @Post()
    async create(@Body() dto: any) {
        const data = await this.service.create(dto);
        return { success: true, data };
    }

    @Get()
    async findAll() {
        const data = await this.service.findAll();
        return { success: true, data };
    }

    @Get(':id/alunos')
    async findAlunosByTurma(@Param('id') id: string) {
        const data = await this.service.findAlunosByTurma(id);
        return { success: true, data };
    }

    @Post(':id/alunos')
    async addAlunoToTurma(@Param('id') id: string, @Body() dto: any) {
        const data = await this.service.createInTurma(id, dto);
        return { success: true, data };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.service.findOne(id);
        return { success: true, data };
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: any) {
        const data = await this.service.update(id, dto);
        return { success: true, data };
    }

    @Patch(':id')
    async partialUpdate(@Param('id') id: string, @Body() dto: any) {
        const data = await this.service.update(id, dto);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.service.remove(id);
        return { success: true };
    }
}
