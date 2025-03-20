import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import moment from 'moment-timezone';
import { SizeUnit } from 'src/types';
import { DEFAULT_TZ } from 'src/constants';
import { User } from 'src/Users/user.entity';
import { IsOptional } from 'class-validator';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'float', nullable: false })
  sizeValue: number;

  @Column({ type: 'float', nullable: false })
  sizeValueLeft: number;

  @Column({ type: 'enum', enum: SizeUnit, nullable: false })
  sizeUnit: SizeUnit;

  @Column({
    type: 'timestamptz',
    transformer: {
      from: (value: Date) =>
        moment.utc(value).tz(DEFAULT_TZ).format('YYYY-MM-DDTHH:mm:ss.sssZ'),
      to: (value: Date) => value,
    },
  })
  expirationDate: Date;

  @ManyToOne(() => User, (user) => user.products, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
