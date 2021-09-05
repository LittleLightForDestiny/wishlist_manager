import db from "./database.service";
import Wishlist from "../interfaces/wishlist.interface";

export async function createWishlist(wishlist: Wishlist):Promise<Wishlist> {
    let key = await db.wishlists?.add(wishlist).then(r=>r).catch(e=>console.log);
    console.log(key);
    return {
        ...wishlist,
        id: 1
    };
}

export async function deleteWishlist(wishlist: Wishlist):Promise<void> {
    await db.wishlists?.delete(wishlist.id!);
}

export async function getWishlist(id: number):Promise<Wishlist|undefined> {
    let wishlist = await db.wishlists?.get(id);
    return wishlist;
}

export async function getAllWishlists():Promise<Wishlist[]|undefined> {
    let wishlists = await db.wishlists?.toArray();
    return wishlists;
}
