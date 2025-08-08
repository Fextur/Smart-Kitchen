# Event-Driven Alert System

## Overview
The Smart Kitchen backend uses an event-driven architecture for generating and broadcasting alerts to users. This system ensures loose coupling between modules while maintaining real-time notifications.

## Architecture Flow
```
Module (UserService/ShoppingListService/ProductService) 
    ↓ emits events
EventEmitter2 
    ↓ routes to
EventsService 
    ↓ delegates to
AlertService 
    ↓ uses
UserService (for inventory users)
    ↓ creates & broadcasts
Alerts to all relevant users
```

## Core Components

### 1. Event Emitters (Source Modules)
- **UserService**: Kitchen operations (join/leave)
- **ShoppingListService**: Shopping list operations (add/edit/clear/transfer)
- **ProductService**: Product deletion (when in shopping list)

### 2. EventsService (Router)
- Listens to all event types
- Routes events to AlertService
- Uses unified event handler

### 3. AlertService (Alert Generator)
- Creates formatted alerts in Hebrew
- Handles user inventory broadcasting
- Manages different alert types and actions

### 4. UserService (User Resolution)
- Resolves inventory users for broadcasting
- Provides user context for alerts

## Event Types & Actions

### User Events (UserService)
| Event | Action | Description |
|-------|--------|-------------|
| `ADD_KITCHEN` | - | Kitchen created |
| `USER_ENTERED_KITCHEN` | - | User joined kitchen |
| `USER_LEFT_KITCHEN` | - | User left kitchen |

### Shopping List Events (ShoppingListService)
| Event | Action | Description |
|-------|--------|-------------|
| `ADD_TO_SHOPPING_LIST` | - | Item added to shopping list |
| `EDIT_SHOPPING_LIST` | `updated` | Item updated |
| `EDIT_SHOPPING_LIST` | `removed` | Item removed |
| `EDIT_SHOPPING_LIST` | `cleared` | All items cleared |
| `EDIT_SHOPPING_LIST` | `transferred-shopping-to-kitchen` | Items transferred to kitchen |

### Product Events (ProductService)
| Event | Action | Description |
|-------|--------|-------------|
| `EDIT_SHOPPING_LIST` | `transferred-to-kitchen` | Product deleted (was in shopping list) |

## Event Emission Points

### UserService Events
- **Kitchen Creation**: When `createKitchen()` succeeds
- **User Join**: When `joinKitchenByHash()` succeeds
- **User Leave**: When `updateUser()` changes inventory

### ShoppingListService Events
- **Add Items**: When `addProductsToShoppingList()` processes items
- **Update Item**: When `updateProductInShoppingList()` modifies properties
- **Remove Item**: When `removeProductFromShoppingList()` deletes item
- **Clear List**: When `clearShoppingList()` removes all items
- **Transfer Items**: When `transferProductsToInventory()` moves items

### ProductService Events
- **Delete Product**: When `delete()` removes product that was in shopping list

## Event Payload Structure
```typescript
{
  type: AlertType,
  userId: string,
  metadata?: {
    action?: string,
    itemName?: string,
    itemNames?: string[],
    userName?: string,
    kitchenName?: string,
    // ... other context data
  },
  broadcastToUserInventory?: boolean
}
```

## Alert Descriptions (Hebrew)

### User Alerts
- Kitchen created: "מטבח חדש נוצר"
- User entered: "{userName} נכנס למטבח"
- User left: "{userName} יצא מהמטבח"

### Shopping List Alerts
- Item added: "{itemName} נוסף לרשימת הקניות"
- Item updated: "{itemName} עודכן ברשימת הקניות"
- Item removed: "{itemName} הוסר מרשימת הקניות"
- Items cleared: "X פריטים הועברו למטבח"
- Items transferred: "{itemName} הועבר למטבח מרשימת הקניות"

### Product Alerts
- Product deleted: "{itemName} הוסר מרשימת הקניות (מוצר נמחק)"

## Broadcasting Logic
- **Kitchen Events**: Broadcast to all users in the same inventory
- **Shopping List Events**: Broadcast to all users in the same inventory
- **Product Events**: Broadcast to all users in the same inventory

## Dependencies
- **EventEmitter2**: For event emission and listening
- **JWT Authentication**: For user context in controllers
- **TypeORM**: For database operations and user resolution

## Key Features
- **Loose Coupling**: Modules emit minimal events without knowing about alerts
- **Centralized Formatting**: All alert descriptions handled in AlertService
- **Real-time Broadcasting**: Events reach all relevant users immediately
- **Event Logging**: Debug logging throughout the system for troubleshooting
- **Type Safety**: Strong TypeScript typing for all events and payloads
