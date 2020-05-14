import Wishlist, { WishlistBuild, WishlistTag } from "../../interfaces/wishlist.interface";

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

const remapTags = (tags: string[]): WishlistTag[] => {
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
                return WishlistTag.MNK;
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

export const importLittleLight = (content: LittleLightWishlistData): { wishlist: Wishlist, builds: WishlistBuild[] } => {
    return {
        wishlist: { name: content.name || "", description: content.description || "" },
        builds: content.data.map((w) => ({
            description: w.description,
            itemHash: w.hash,
            name: w.name,
            plugs: w.plugs,
            tags: remapTags(w.tags),
        }))
    };
}