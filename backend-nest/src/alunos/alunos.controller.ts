import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { AlunosService } from './alunos.service';

@Controller('alunos')
export class AlunosController {
    constructor(private readonly alunosService: AlunosService) { }

    @Post()
    async create(@Body() createDto: any) {
        const data = await this.alunosService.create(createDto);
        return { success: true, data };
    }

    @Get()
    async findAll() {
        const data = await this.alunosService.findAll();
        return { success: true, data };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.alunosService.findOne(id);
        return { success: true, data };
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        const data = await this.alunosService.update(id, updateDto);
        return { success: true, data };
    }

    @Patch(':id')
    async partialUpdate(@Param('id') id: string, @Body() updateDto: any) {
        const data = await this.alunosService.update(id, updateDto);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.alunosService.remove(id);
        return { success: true };
    }
}
