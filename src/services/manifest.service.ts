import axios from 'axios';
import { getDestinyManifest } from 'bungie-api-ts/destiny2/api';
import { DestinyCollectibleDefinition, DestinyInventoryItemDefinition, DestinyPlugSetDefinition, DestinyPresentationNodeDefinition } from 'bungie-api-ts/destiny2/interfaces';
import { HttpClient } from 'bungie-api-ts/http';
import Dexie from 'dexie';

const bungieBaseUrl = "https://www.bungie.net/";
const language = "en";

const db: DestinyManifestDb = new Dexie('destiny_manifest_db');

interface DestinyManifestDb extends Dexie {
    content?: Dexie.Table<{ version: string, data: DestinyManifestData }, string>;
}

interface DestinyManifestData {
    DestinyPresentationNodeDefinition?: { [id: number]: DestinyPresentationNodeDefinition };
    DestinyCollectibleDefinition?: { [id: number]: DestinyCollectibleDefinition };
    DestinyInventoryItemDefinition?: { [id: number]: DestinyInventoryItemDefinition };
    DestinyPlugSetDefinition?: { [id: number]: DestinyPlugSetDefinition };
}

interface HashesByName{
    [name:string]: number[];
}

let manifestData: DestinyManifestData;
let inventoryItemHashesByName:HashesByName;

db.version(1).stores({
    content: 'version',
});

async function client(data: any): Promise<HttpClient> {
    const result = await axios(data);
    return result.data;
}

export async function loadManifest(): Promise<void> {
    const manifest = await getDestinyManifest(client);
    const version = manifest?.Response?.version;
    const storedVersion = await db.content?.get(version);
    if (storedVersion) {
        manifestData = storedVersion.data;
        return;
    }
    db.content?.clear();
    manifestData = {};
    const components = manifest.Response.jsonWorldComponentContentPaths[language];
    manifestData.DestinyPresentationNodeDefinition = await downloadManifestComponent<DestinyPresentationNodeDefinition>(
        components.DestinyPresentationNodeDefinition);
    manifestData.DestinyCollectibleDefinition = await downloadManifestComponent<DestinyCollectibleDefinition>(
        components.DestinyCollectibleDefinition);
    manifestData.DestinyInventoryItemDefinition = await downloadManifestComponent<DestinyInventoryItemDefinition>(
        components.DestinyInventoryItemDefinition);
    manifestData.DestinyPlugSetDefinition = await downloadManifestComponent<DestinyPlugSetDefinition>(
        components.DestinyPlugSetDefinition);
    db.content?.add({ version: version, data: manifestData }, version);
}

async function downloadManifestComponent<T>(path: string): Promise<{ [id: number]: T }> {
    const url = `${bungieBaseUrl}${path}`;
    const response = await axios(url);
    const data: { [index: number]: T } = response.data;
    return data;
}

export function getPresentationNodes(): { [id: string]: DestinyPresentationNodeDefinition } | undefined {
    return manifestData.DestinyPresentationNodeDefinition;
}

export function getCollectibles(): { [id: string]: DestinyCollectibleDefinition } | undefined {
    return manifestData.DestinyCollectibleDefinition;
}

export function getInventoryItemList(): { [id: string]: DestinyInventoryItemDefinition } | undefined {
    return manifestData.DestinyInventoryItemDefinition;
}

export function getInventoryItemHashesByName(name:string):number[] {
    if(!inventoryItemHashesByName){
        createInventoryItemHashesByNameMap();
    }
    return inventoryItemHashesByName[name] ?? []
}

function createInventoryItemHashesByNameMap(){
    inventoryItemHashesByName = {};
    for(let i in manifestData.DestinyInventoryItemDefinition){
        let item = manifestData.DestinyInventoryItemDefinition[i]
        let name = item?.displayProperties?.name
        let hash = item?.hash
        if(!name || !hash) continue
        if(!inventoryItemHashesByName[name]){
            inventoryItemHashesByName[name] = []
        }
        inventoryItemHashesByName[name].push(hash)
    }
}

export function getCollectibleDefinition(collectibleHash: number): DestinyCollectibleDefinition | undefined {
    return manifestData.DestinyCollectibleDefinition?.[collectibleHash];
}

export function getInventoryItemDefinition(itemHash: number): DestinyInventoryItemDefinition | undefined {
    return manifestData.DestinyInventoryItemDefinition?.[itemHash];
}

export function getPlugSetDefinition(plugSetHash: number): DestinyPlugSetDefinition | undefined {
    return manifestData.DestinyPlugSetDefinition?.[plugSetHash];

}