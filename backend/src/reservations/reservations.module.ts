import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationChambre } from './entities/reservation-chambre.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationChambre])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
