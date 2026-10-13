import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationChambre } from './entities/reservation-chambre.entity.js';
import { ReservationStatus } from './enums/reservation-status.enum.js';
import { Room } from '../rooms/entities/room.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../users/enums/role.enum.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';

const STATUTS_BLOQUANTS = [
  ReservationStatus.EN_ATTENTE,
  ReservationStatus.CONFIRMEE,
  ReservationStatus.EN_COURS,
];

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(ReservationChambre)
    private readonly ligneRepo: Repository<ReservationChambre>,
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private checkDates(arrivee: string, depart: string) {
    const today = new Date().toISOString().slice(0, 10);
    if (arrivee < today) {
      throw new BadRequestException("La date d'arrivée est dans le passé");
    }
    if (depart <= arrivee) {
      throw new BadRequestException(
        "La date de départ doit être après la date d'arrivée",
      );
    }
  }

  private async isRoomFree(roomId: number, arrivee: string, depart: string) {
    const count = await this.ligneRepo
      .createQueryBuilder('rc')
      .innerJoin('rc.reservation', 'r')
      .innerJoin('rc.room', 'room')
      .where('room.id = :roomId', { roomId })
      .andWhere('r.statut IN (:...bloquants)', { bloquants: STATUTS_BLOQUANTS })
      .andWhere('r.dateArrivee < :depart', { depart })
      .andWhere('r.dateDepart > :arrivee', { arrivee })
      .getCount();
    return count === 0;
  }

  async findAvailableRooms(arrivee: string, depart: string) {
    this.checkDates(arrivee, depart);
    const rooms = await this.roomRepo.find({
      where: { disponible: true },
      relations: { category: true },
    });
    const result: Room[] = [];
    for (const room of rooms) {
      if (await this.isRoomFree(room.id, arrivee, depart)) {
        result.push(room);
      }
    }
    return result;
  }

  async create(
    dto: CreateReservationDto,
    user: { userId: number; role: Role },
  ) {
    this.checkDates(dto.dateArrivee, dto.dateDepart);

    let clientId = user.userId;
    if (user.role !== Role.CLIENT) {
      if (!dto.clientId) {
        throw new BadRequestException(
          'clientId est obligatoire pour une réservation faite au guichet',
        );
      }
      clientId = dto.clientId;
    }

    const client = await this.userRepo.findOneBy({ id: clientId });
    if (!client) throw new NotFoundException(`Client ${clientId} not found`);

    const roomIds = [...new Set(dto.roomIds)];
    const rooms = await this.roomRepo.find({
      where: { id: In(roomIds) },
      relations: { category: true },
    });
    if (rooms.length !== roomIds.length) {
      throw new NotFoundException('Une des chambres est introuvable');
    }

    for (const room of rooms) {
      const libre =
        room.disponible &&
        (await this.isRoomFree(room.id, dto.dateArrivee, dto.dateDepart));
      if (!libre) {
        throw new ConflictException(
          `La chambre ${room.numero} n'est pas disponible pour ces dates`,
        );
      }
    }

    const nights = Math.round(
      (Date.parse(dto.dateDepart) - Date.parse(dto.dateArrivee)) / 86400000,
    );
    const lignes = rooms.map((room) =>
      this.ligneRepo.create({
        room,
        prixParNuit: Number(room.category.pricePerNight),
      }),
    );
    const prixTotal = lignes.reduce(
      (sum, l) => sum + l.prixParNuit * nights,
      0,
    );

    const reservation = this.reservationRepo.create({
      dateArrivee: dto.dateArrivee,
      dateDepart: dto.dateDepart,
      client,
      prixTotal,
      chambres: lignes,
    });
    const saved = await this.reservationRepo.save(reservation);
    return this.findOne(saved.id);
  }

  async findOne(id: number) {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: {
        client: true,
        chambres: { room: { category: true } },
      },
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    return reservation;
  }
}
