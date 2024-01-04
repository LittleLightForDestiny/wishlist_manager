import axios from "axios";
import { DestinyCollectibleDefinition, DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";
import { uniqBy } from "lodash";
import { manifest } from ".";
import { getCollectibleDefinition, getCollectibles, getInventoryItemDefinition, getInventoryItemList, getPresentationNodes } from "./manifest.service";

const collectionsWeaponsRootNode = 3790247699;
const destinyWeaponType = 3;
let filterableWeapons: ExtendedCollectible[];
let allCollectibles: { [id: string]: DestinyCollectibleDefinition };
let sourceToSeason: { [id: string]: string };
let seasonsBackup: { [id: string]: string };
let watermarkToSeason: { [id: string]: string };

export interface ExtendedCollectible extends DestinyInventoryItemDefinition{
    season?: number;
    confirmed: boolean;
}

async function loadD2AI() {
    if (sourceToSeason) return;
    sourceToSeason = (await axios.get("https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/seasons.json")).data;
    seasonsBackup = (await axios.get("https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/seasons_backup.json")).data;
    watermarkToSeason = (await axios.get("https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/watermark-to-season.json")).data;
}

export async function getFilterableWeapons(): Promise<ExtendedCollectible[]> {
    if (filterableWeapons) return filterableWeapons;
    await loadD2AI();
    allCollectibles = getCollectibles();
    const collectionItems = getItemsFromCollections(collectionsWeaponsRootNode);
    const craftableItems = getItemsFromCraftables()
    const itemVariations = getAllItems([...collectionItems, ...craftableItems])
    filterableWeapons = uniqBy([...collectionItems, ...craftableItems, ...itemVariations], (i)=>i.hash);
    return filterableWeapons;
}

function getItemsFromCollections(nodeHash: number) : ExtendedCollectible[] {
    const nodes = getPresentationNodes();
    const node = nodes[nodeHash];
    const childNodes = node?.children?.presentationNodes ?? []
    let items:ExtendedCollectible[]= []
    for( let n of childNodes){
        let childItems = getItemsFromCollections(n.presentationNodeHash)
        items = [...items, ...childItems]
    }
    const childCollectibles = node?.children?.collectibles ?? []
    for( let c of childCollectibles){
        const collectible = allCollectibles[c.collectibleHash];
        const item = getInventoryItemDefinition(collectible.itemHash);
        if (item?.itemType === destinyWeaponType) {
            const extended = getExtendedItem(item, collectible)
            items.push(extended)
        }
    }
    return items
}

function getItemsFromCraftables() : ExtendedCollectible[] {
    const patterns = Object.values(getInventoryItemList()).filter((i)=>i.itemType === 30)
    const items:ExtendedCollectible[] = patterns.map((p)=>{
        const outputHash = p?.crafting?.outputItemHash
        if(!outputHash) return null
        const  item = getInventoryItemDefinition(outputHash)
        if(!item) return null
        return getExtendedItem(item, null, p)
    }).filter((i)=>!!i)
    return items
}

function getAllItems(items:ExtendedCollectible[]): ExtendedCollectible[]{
    const allItems = Object.values(manifest.getInventoryItemList())
    const extendedItems = allItems.map((i)=>getExtendedItem(i))

    return extendedItems.filter((item)=>{
        if(!item?.equippable) return false
        if(item.itemType !== 3) return false
        return true
    });

}

function getExtendedItem(
    item:DestinyInventoryItemDefinition, 
    collectible?: DestinyCollectibleDefinition,
    craftable?: DestinyInventoryItemDefinition,
    ): ExtendedCollectible {
    const confirmed = collectible?.itemHash === item.hash || craftable?.crafting?.outputItemHash === item.hash;
    return {
        ...item,
        season: getSeason(collectible, item),
        confirmed: confirmed,
    };
}

export async function getSeasonByItemHash(itemHash: number) {
    await loadD2AI();
    const item = getInventoryItemDefinition(itemHash);
    const collectible = getCollectibleDefinition(item?.collectibleHash);
    return getSeason(collectible, item);

}

function getSeason(collectible?: DestinyCollectibleDefinition, item?: DestinyInventoryItemDefinition): number | undefined {
    if (item?.iconWatermark && watermarkToSeason[item?.iconWatermark]) {
        return parseInt(watermarkToSeason[item?.iconWatermark]);
    }
    if (item?.iconWatermarkShelved && watermarkToSeason[item?.iconWatermarkShelved]) {
        return parseInt(watermarkToSeason[item?.iconWatermarkShelved]);
    }
    if (sourceToSeason[collectible?.sourceHash]) {
        return parseInt(sourceToSeason[collectible?.sourceHash]);
    }
    if (sourceToSeason[collectible?.itemHash]) {
        return parseInt(sourceToSeason[collectible?.itemHash]);
    }
    if (seasonsBackup[collectible?.sourceHash]) {
        return parseInt(seasonsBackup[collectible?.sourceHash]);
    }
    if (seasonsBackup[collectible?.itemHash]) {
        return parseInt(seasonsBackup[collectible?.itemHash]);
    }
    return 1;
}
