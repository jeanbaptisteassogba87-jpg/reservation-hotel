import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../enums/role.enum.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true, select: false })
  motDePasse: string;

  @Column()
  telephone: string;

  @Column({ type: 'enum', enum: Role, default: Role.CLIENT })
  role: Role;

  @Column({ default: false })
  aUnCompte: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;
}
