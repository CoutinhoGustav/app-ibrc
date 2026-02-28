import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RegistrosService } from './registros.service';

@Controller('registros')
export class RegistrosController {
    constructor(private readonly registrosService: RegistrosService) { }

    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
        const result = await this.registrosService.findAll(Number(page), Number(limit));
        // Needs to format according to api.ts expectations
        // api.ts expects: { success: true, data: [...], pagination: {...} }
        return { success: true, ...result };
    }

    @Get('search')
    async search(@Query('q') query: string) {
        const data = await this.registrosService.search(query);
        return { success: true, data };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.registrosService.findById(id);
        return { success: true, data };
    }

    @Post()
    async create(@Body() createDto: any) {
        const data = await this.registrosService.create(createDto);
        return { success: true, data };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        const data = await this.registrosService.update(id, updateDto);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.registrosService.remove(id);
        return { success: true };
    }
}
