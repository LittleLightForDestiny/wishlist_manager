import axios from "axios";
import { DestinyCollectibleDefinition, DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";
import { getCollectibleDefinition, getCollectibles, getInventoryItemDefinition, getPresentationNodes } from "./manifest.service";

const rootNode = 3790247699;
const destinyWeaponType = 3;
let filteredWeapons: ExtendedCollectible[];
let allCollectibles: { [id: string]: DestinyCollectibleDefinition };
let sourceToSeason: { [id: string]: number };
let watermarkToSeason: { [id: string]: number };

export interface ExtendedCollectible extends DestinyCollectibleDefinition {
    item?: DestinyInventoryItemDefinition;
    season?: number;
}

async function loadD2AI() {
    if (sourceToSeason) return;
    sourceToSeason = (await axios.get("https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/seasons.json")).data;
    watermarkToSeason = (await axios.get("https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/watermark-to-season.json")).data;
}

export async function getFilterableWeapons(): Promise<ExtendedCollectible[]> {
    if (filteredWeapons) return filteredWeapons;
    await loadD2AI();
    filteredWeapons = [];
    allCollectibles = getCollectibles()!;
    addItems(rootNode);
    return filteredWeapons;
}

function addItems(nodeHash: number) {
    const nodes = getPresentationNodes()!;
    const node = nodes[nodeHash];
    node?.children?.presentationNodes?.forEach((node) => addItems(node.presentationNodeHash));
    node?.children?.collectibles?.forEach((c) => {
        const collectible = allCollectibles[c.collectibleHash];
        const item = getInventoryItemDefinition(collectible.itemHash);
        if (item?.itemType === destinyWeaponType) {
            filteredWeapons.push(getExtendedCollectible(collectible));
        }
    });
}

function getExtendedCollectible(collectible: DestinyCollectibleDefinition): ExtendedCollectible {
    const item = getInventoryItemDefinition(collectible.itemHash);
    return {
        ...collectible,
        season: getSeason(collectible, item),
        item
    };
}

export async function getSeasonByItemHash(itemHash: number) {
    await loadD2AI();
    const item = getInventoryItemDefinition(itemHash);
    const collectible = getCollectibleDefinition(item?.collectibleHash);
    return getSeason(collectible, item);

}

function getSeason(collectible: DestinyCollectibleDefinition, item?: DestinyInventoryItemDefinition): number | undefined {
    if (item?.iconWatermark && watermarkToSeason[item?.iconWatermark]) {
        return watermarkToSeason[item?.iconWatermark];
    }
    if (item?.iconWatermarkShelved && watermarkToSeason[item?.iconWatermarkShelved]) {
        return watermarkToSeason[item?.iconWatermarkShelved];
    }
    if (sourceToSeason[collectible.sourceHash]) {
        return sourceToSeason[collectible.sourceHash];
    }
    return 1;
}
