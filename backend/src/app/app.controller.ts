import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Hello Worldエンドポイント' })
  @ApiResponse({ status: 200, description: '正常なレスポンス', type: String })
  getHello(): string {
    return this.appService.getHello();
    return 'Hello World';
  }
}
