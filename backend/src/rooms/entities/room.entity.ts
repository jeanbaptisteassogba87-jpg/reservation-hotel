import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoomCategory } from '../../room-categories/entities/room-category.entity.js';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numero: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  equipements: string;

  @Column({ default: true })
  disponible: boolean;

  @ManyToOne(() => RoomCategory, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: RoomCategory;

  @Column()
  categoryId: number;
}
