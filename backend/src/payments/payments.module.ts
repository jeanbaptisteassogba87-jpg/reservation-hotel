import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { Payment } from './entities/payment.entity.js';
import { Reservation } from '../reservations/entities/reservation.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Reservation])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
