import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationChambre } from './entities/reservation-chambre.entity.js';
import { Room } from '../rooms/entities/room.entity.js';
import { User } from '../users/entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationChambre, Room, User]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
