import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { ReservationChambre } from './reservation-chambre.entity.js';
import { ReservationStatus } from '../enums/reservation-status.enum.js';
import { decimalTransformer } from '../../common/decimal.transformer.js';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  dateArrivee: string;

  @Column({ type: 'date' })
  dateDepart: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.EN_ATTENTE,
  })
  statut: ReservationStatus;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  prixTotal: number;

  @ManyToOne(() => User, { nullable: false })
  client: User;

  @ManyToOne(() => User, { nullable: true })
  confirmePar: User | null;

  @OneToMany(() => ReservationChambre, (rc) => rc.reservation, {
    cascade: true,
  })
  chambres: ReservationChambre[];

  @CreateDateColumn()
  dateCreation: Date;
}
