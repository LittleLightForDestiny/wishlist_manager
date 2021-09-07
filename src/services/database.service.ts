import Dexie from 'dexie';
import 'dexie-observable';
import Wishlist, { WishlistBuild } from '../interfaces/wishlist.interface';

const db:WishlistBuilderDb = new Dexie('wishlist_builder');

interface WishlistBuilderDb extends Dexie{
    wishlists?:Dexie.Table<Wishlist, number>;
    wishlistBuilds?:Dexie.Table<WishlistBuild, number>;
}

db.version(1).stores({
  wishlists: 'id++,name,description',
  wishlistBuilds: 'id++,tags,itemHash,wishlistId,[wishlistId+itemHash]',
});

export default db;