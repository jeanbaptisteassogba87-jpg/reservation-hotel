import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RoomCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerNight: number;

  @Column()
  capacity: number;
}
