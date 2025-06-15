import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alert.entity';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { UserModule } from '../Users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert]),
    forwardRef(() => UserModule),
  ],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
