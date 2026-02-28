import { Controller, Get, Patch, Body } from '@nestjs/common';
import { SystemStatusService } from './system-status.service';

@Controller('system-status')
export class SystemStatusController {
    constructor(private readonly service: SystemStatusService) { }

    @Get()
    getStatus() {
        return this.service.getStatus();
    }

    @Patch()
    toggle(@Body('isCallActive') isCallActive: boolean) {
        return this.service.toggleCall(isCallActive);
    }
}
