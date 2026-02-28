import { Controller, Get, Post, Body } from '@nestjs/common';
import { AttendancesService } from './attendances.service';

@Controller('attendances')
export class AttendancesController {
    constructor(private readonly service: AttendancesService) { }

    @Post()
    create(@Body() dto: any) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }
}
