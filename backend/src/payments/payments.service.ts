import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity.js';
import { Reservation } from '../reservations/entities/reservation.entity.js';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum.js';
import { PaymentStatus } from './enums/payment-status.enum.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { Role } from '../users/enums/role.enum.js';

type AuthUser = { userId: number; role: Role };

const round = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
  ) {}

  async totalPaid(reservationId: number): Promise<number> {
    const row = await this.paymentRepo
      .createQueryBuilder('p')
      .innerJoin('p.reservation', 'r')
      .select('COALESCE(SUM(p.montant), 0)', 'total')
      .where('r.id = :reservationId', { reservationId })
      .andWhere('p.statutPaiement = :statut', { statut: PaymentStatus.PAYE })
      .getRawOne<{ total: string }>();
    return Number(row?.total ?? 0);
  }

  private async loadReservation(id: number, user: AuthUser) {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: { client: true },
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    if (user.role === Role.CLIENT && reservation.client.id !== user.userId) {
      throw new ForbiddenException('Cette réservation n’est pas la vôtre');
    }
    return reservation;
  }

  async create(dto: CreatePaymentDto, user: AuthUser) {
    const reservation = await this.loadReservation(dto.reservationId, user);

    const refusees = [ReservationStatus.ANNULEE, ReservationStatus.REFUSEE];
    if (refusees.includes(reservation.statut)) {
      throw new BadRequestException(
        `Impossible de payer une réservation ${reservation.statut}`,
      );
    }

    const paid = await this.totalPaid(reservation.id);
    const reste = round(reservation.prixTotal - paid);
    if (dto.montant > reste) {
      throw new BadRequestException(
        `Le montant dépasse le reste à payer (${reste})`,
      );
    }

    const payment = this.paymentRepo.create({
      montant: dto.montant,
      modePaiement: dto.modePaiement,
      statutPaiement: PaymentStatus.PAYE,
      reservation,
    });
    const saved = await this.paymentRepo.save(payment);

    return {
      id: saved.id,
      montant: saved.montant,
      modePaiement: saved.modePaiement,
      statutPaiement: saved.statutPaiement,
      datePaiement: saved.datePaiement,
      reste: round(reste - dto.montant),
    };
  }

  async findByReservation(reservationId: number, user: AuthUser) {
    await this.loadReservation(reservationId, user);
    return this.paymentRepo.find({
      where: { reservation: { id: reservationId } },
      order: { datePaiement: 'ASC' },
    });
  }
}
