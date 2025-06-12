import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';
import { AlertModule } from '../Alerts/alert.module';

@Global()
@Module({  imports: [
    EventEmitterModule.forRoot(),
    AlertModule,
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
