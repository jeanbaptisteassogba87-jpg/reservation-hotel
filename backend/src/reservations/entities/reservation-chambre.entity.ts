import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Reservation } from './reservation.entity.js';
import { Room } from '../../rooms/entities/room.entity.js';
import { decimalTransformer } from '../../common/decimal.transformer.js';

@Entity()
export class ReservationChambre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  prixParNuit: number;

  @ManyToOne(() => Reservation, (r) => r.chambres, { onDelete: 'CASCADE' })
  reservation: Relation<Reservation>;

  @ManyToOne(() => Room, { nullable: false, eager: true })
  room: Room;
}
