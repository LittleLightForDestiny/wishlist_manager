import axios from "axios";
import { DestinyCollectibleDefinition, DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";
import { getCollectibles, getInventoryItemDefinition, getPresentationNodes } from "./manifest.service";

const rootNode = 3790247699;
const destinyWeaponType = 3;
let filteredWeapons: ExtendedCollectible[];
let allCollectibles: { [id: string]: DestinyCollectibleDefinition };
let sourceToSeason: { [id: string]: number };

export interface ExtendedCollectible extends DestinyCollectibleDefinition {
    item?: DestinyInventoryItemDefinition;
    season?: number;
}

async function loadD2AI() {
    sourceToSeason = (await axios.get("https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/seasons.json")).data;
}

export async function getFilterableWeapons(): Promise<ExtendedCollectible[]> {
    if (filteredWeapons) return filteredWeapons;
    await loadD2AI();
    console.log(sourceToSeason);
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
    return {
        ...collectible,
        season: getSeason(collectible),
        item: getInventoryItemDefinition(collectible.itemHash)
    };
}

function getSeason(collectible: DestinyCollectibleDefinition): number | undefined {
    if (!collectible.sourceHash) return undefined;
    return sourceToSeason[collectible.itemHash];
}
