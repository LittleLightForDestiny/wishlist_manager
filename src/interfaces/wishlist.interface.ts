export enum WishlistTag{
    GodPvE="GodPvE",
    GodPvP="GodPvP",
    PvE="PvE",
    PvP="PvP",
    Trash="Trash",
    Curated="Curated",
    Mouse="Mouse",
    Controller="Controller",
    None="None"
}

export interface WishlistBuild{
    id?:number;
    wishlistId?:number;
    itemHash?:number;
    name?:string;
    description?:string;
    tags?:WishlistTag[];
    plugs?:number[][];
}

export interface Wishlist{
    id?:number;
    name?:string;
    description?:string;
}

export default Wishlist;