import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Role } from '../users/enums/role.enum.js';

type AuthRequest = { user: { userId: number; role: Role } };

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req: AuthRequest) {
    return this.service.create(dto, req.user);
  }

  @Get('reservation/:reservationId')
  findByReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Req() req: AuthRequest,
  ) {
    return this.service.findByReservation(reservationId, req.user);
  }
}
