import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity.js';
import { PaymentMode } from '../enums/payment-mode.enum.js';
import { PaymentStatus } from '../enums/payment-status.enum.js';
import { decimalTransformer } from '../../common/decimal.transformer.js';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  montant: number;

  @CreateDateColumn()
  datePaiement: Date;

  @Column({ type: 'enum', enum: PaymentMode })
  modePaiement: PaymentMode;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PAYE,
  })
  statutPaiement: PaymentStatus;

  @ManyToOne(() => Reservation, { nullable: false, onDelete: 'CASCADE' })
  reservation: Reservation;
}
