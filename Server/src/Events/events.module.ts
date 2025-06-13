import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';
import { AlertModule } from '../Alerts/alert.module';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Set a higher value if you're handling large volumes
      maxListeners: 20,
      // This is important! Ensures we capture all events
      wildcard: true,
      // For debugging purposes
      verboseMemoryLeak: true,
    }),
    AlertModule, // Import AlertModule (which imports UserModule)
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
