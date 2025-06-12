# Events System for Smart Kitchen

This system implements an event-driven architecture to create alerts from any part of the application.

## How to Use

1. Import the `EventsService` into your service:

```typescript
import { Injectable } from '@nestjs/common';
import { EventsService, EventTypes, AlertEvent } from '../Events/events.service';
import { AlertType } from '../types';

@Injectable()
export class YourService {
  constructor(private eventsService: EventsService) {}

  // Your methods here
}
```

2. Create and emit an alert:

```typescript
async createSomeAlert(userId: string, kitchenId: string) {
  const alertPayload: AlertEvent = {
    type: AlertType.SYSTEM_NOTIFICATION,  // Choose the appropriate alert type
    userId,                               // Target user ID
    title: 'Alert Title',                 // Title shown to user
    description: 'Detailed description',  // Optional description
    metadata: {                           // Any additional data
      someKey: 'someValue',
    },
    kitchenId,                            // Optional kitchen ID
  };

  // Emit the event
  this.eventsService.emitEvent(EventTypes.CREATE_ALERT, alertPayload);
}
```

## Available Event Types

- `EventTypes.CREATE_ALERT` - Generic alert creation
- `EventTypes.KITCHEN_ALERT` - Kitchen-related alerts
- `EventTypes.USER_ALERT` - User-related alerts
- `EventTypes.SHOPPING_LIST_ALERT` - Shopping list related alerts

## Available Alert Types

- `AlertType.ADD_KITCHEN` - Kitchen created
- `AlertType.EDIT_KITCHEN` - Kitchen updated
- `AlertType.ADD_TO_SHOPPING_LIST` - Item added to shopping list
- `AlertType.EDIT_SHOPPING_LIST` - Shopping list item updated
- `AlertType.USER_ENTERED_KITCHEN` - User entered kitchen
- `AlertType.USER_LEFT_KITCHEN` - User left kitchen
- `AlertType.PRODUCT_EXPIRING` - Product is about to expire
- `AlertType.LOW_STOCK` - Low stock of a product
- `AlertType.ITEM_ADDED` - Item added to inventory
- `AlertType.ITEM_REMOVED` - Item removed from inventory
- `AlertType.RECIPE_RECOMMENDATION` - Recipe recommendation
- `AlertType.SYSTEM_NOTIFICATION` - System notification

## Adding New Alert Types

1. Add a new type to the `AlertType` enum in `types.ts`
2. Use the new type when emitting events
