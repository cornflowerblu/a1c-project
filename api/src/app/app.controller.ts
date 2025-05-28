import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    try {
      return this.appService.getData();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get application data');
    }
  }
}
