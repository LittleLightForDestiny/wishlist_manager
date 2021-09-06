import Wishlist, { WishlistBuild, WishlistTag } from "../../interfaces/wishlist.interface";
import { getBuilds } from "../../services/wishlistBuild.service";
import { getWishlist } from "../../services/wishlists.service";

interface LittleLightWishlistBuild {
    name: string;
    description: string;
    hash: number;
    plugs: number[][];
    tags: string[];
}

interface LittleLightWishlistData {
    name: string;
    description: string;
    data: LittleLightWishlistBuild[];
}

const importTags = (tags: string[]): WishlistTag[] => {
    return tags.map((t) => {
        switch (t.toLocaleLowerCase()) {
            case "pve":
                return WishlistTag.PvE;
            case "godpve":
                return WishlistTag.GodPvE;
            case "pvp":
                return WishlistTag.PvP;
            case "godpvp":
                return WishlistTag.GodPvP;
            case "mnk":
            case "mouse":
                return WishlistTag.Mouse;
            case "controller":
                return WishlistTag.Controller;
            case "bungie":
                return WishlistTag.Curated;
            case "trash":
                return WishlistTag.Trash;
        }
        return WishlistTag.None;
    }).filter((t) => t !== WishlistTag.None);
}

const exportTags = (tags: WishlistTag[]): string[] => {
    const tagMap: { [tag: string]: string } = {
        [WishlistTag.GodPvE]: 'GodPVE',
        [WishlistTag.GodPvP]: 'GodPVP',
        [WishlistTag.PvE]: 'PVE',
        [WishlistTag.PvP]: 'PVP',
        [WishlistTag.Curated]: 'Bungie',
        [WishlistTag.Trash]: 'Trash',
        [WishlistTag.Mouse]: 'mouse',
        [WishlistTag.Controller]: 'Controller',
    };
    return tags.map((t: string) => {
        let llTag = tagMap[t];
        if (llTag) return llTag;
        return "";
    }).filter((t) => t !== "");
}

export const importLittleLight = (content: LittleLightWishlistData): { wishlist: Wishlist, builds: WishlistBuild[] } => {
    return {
        wishlist: { name: content.name || "", description: content.description || "" },
        builds: content.data.map((w) => ({
            description: w.description,
            itemHash: w.hash,
            name: w.name,
            plugs: w.plugs,
            tags: importTags(w.tags),
        }))
    };
}

export const exportLittleLight = async (wishlistId: number): Promise<Blob> => {
    let wishlist = await getWishlist(wishlistId);
    let builds = await getBuilds(wishlistId);
    let dataBuilds: LittleLightWishlistBuild[] = builds.map((b): LittleLightWishlistBuild => {
        return {
            description: b.description || "",
            hash: b.itemHash!,
            name: b.name || "",
            plugs: b.plugs?.filter((p) => p.length) || [],
            tags: exportTags(b.tags || [])
        };
    });
    let json = JSON.stringify({
        description: wishlist?.description || "",
        name: wishlist?.name || "",
        data: dataBuilds
    });
    var blob = new Blob([json], { type: "application/json" });
    return blob;
}