import Axios from "axios";
import { DestinyInventoryItemDefinition, DestinyPresentationNodeDefinition, DestinyCollectibleDefinition, DestinyPlugSetDefinition } from "bungie-api-ts/destiny2/interfaces";


let _presentationNodes: { [id: string]: DestinyPresentationNodeDefinition };
let _collectibles: { [id: string]: DestinyCollectibleDefinition };
let _inventoryItemList: { [id: string]: DestinyInventoryItemDefinition };

let _inventoryItemDefs: { [id: string]: DestinyInventoryItemDefinition } = {};
let _plugSetDefs: { [id: string]: DestinyPlugSetDefinition } = {};

export async function loadPresentationNodes(): Promise<{ [id: string]: DestinyPresentationNodeDefinition }> {
    if (_presentationNodes) return _presentationNodes;
    let res = await Axios.get("./data/en/DestinyPresentationNodeDefinition.json");
    _presentationNodes = res.data;
    return _presentationNodes;
}

export async function loadCollectibles(): Promise < { [id: string]: DestinyCollectibleDefinition } > {
    if(_collectibles) return _collectibles;
    let res = await Axios.get("./data/en/DestinyCollectibleDefinition.json");
    _collectibles = res.data;
    return _collectibles;
}

export async function loadInventoryItemList(): Promise < { [id: string]: DestinyInventoryItemDefinition } > {
    if(_inventoryItemList) return _inventoryItemList;
    let res = await Axios.get("./data/en/DestinyInventoryItemDefinition.json");
    _inventoryItemList = res.data;
    return _inventoryItemList;
}

export async function loadInventoryItemDefinition(itemHash:number):Promise<DestinyInventoryItemDefinition>{
    if(_inventoryItemDefs[itemHash]) return _inventoryItemDefs[itemHash];
    let res = await Axios.get(`./data/en/DestinyInventoryItemDefinition/${itemHash}.json`);
    _inventoryItemDefs[itemHash] = res.data;
    return _inventoryItemDefs[itemHash];
}

export async function loadPlugSetDefinition(plugSetHash:number):Promise<DestinyPlugSetDefinition>{
    if(_inventoryItemDefs[plugSetHash]) return _plugSetDefs[plugSetHash];
    let res = await Axios.get(`./data/en/DestinyPlugSetDefinition/${plugSetHash}.json`);
    _plugSetDefs[plugSetHash] = res.data;
    return _plugSetDefs[plugSetHash];

}