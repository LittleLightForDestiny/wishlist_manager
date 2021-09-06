import { WishlistBuild } from "../interfaces/wishlist.interface";
import db from "./database.service";

export async function saveBuild(build: WishlistBuild): Promise<WishlistBuild> {
    if (build.id) {
        await db.wishlistBuilds?.update(build.id, build);
        return build;
    }
    let key = await db.wishlistBuilds?.add(build);
    return {
        ...build,
        id: key
    };
}
export async function getBuilds(wishlistId: number, itemHash?: number): Promise<WishlistBuild[]> {
    let query = db.wishlistBuilds!.where('wishlistId').equals(wishlistId);
    if (itemHash) {
        query = query.and((w) => {
            return w.itemHash === itemHash
        });
    }
    let builds = await query.toArray();

    return builds || [];
}

export async function deleteBuild(id: number) {
    console.log("delete build " + id);
    await db.wishlistBuilds!.delete(id);
}