// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   OneToOne,
//   JoinColumn,
//   OneToMany,
// } from 'typeorm';
// import { Inventory } from 'src/Inventory/inventory.entity';
// import { Product } from 'src/Products/product.entity';

// @Entity('shopping_lists')
// export class ShoppingList {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @OneToOne(() => Inventory, (inventory) => inventory.shoppingList, {
//     nullable: false,
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn() // This side owns the FK column: shopping_lists.inventoryId
//   inventory: Inventory;

//   @OneToMany(() => Product, (product) => product.shoppingList, {
//     nullable: true,
//   })
//   products: Product[];
// }
