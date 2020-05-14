import { default as axios } from 'axios';
import { getDestinyManifest } from 'bungie-api-ts/destiny2/api';
import fs from 'fs-extra';
import { DestinyInventoryItemDefinition, DestinyItemSocketEntryDefinition, DestinyCollectibleDefinition, DestinyPresentationNodeDefinition } from 'bungie-api-ts/destiny2/interfaces';
import _ from 'lodash';

var bungieRoot = "https://www.bungie.net";

async function client(data: any) {
    let result = await axios(data);
    return result.data;
}

async function getManifest(): Promise<any> { 
    let manifest = await getDestinyManifest(client);
    let path = manifest.Response.jsonWorldContentPaths['en'];
    let url = `${bungieRoot}${path}`;
    let definitions = await axios.get(url);
    return definitions;
}

async function saveItems(definitions: any, tableName: string) {
    let filePath = "./public/data/en/" + tableName;
    try {
        await fs.mkdirp(filePath);
    } catch (e) { }
    let defs = definitions.data[tableName];
    for (let i in defs) {
        await fs.writeFile(`${filePath}/${i}.json`, JSON.stringify(defs[i]));
    }
}

async function saveList<T extends {[id:string]:any}>(definitions: any, tableName: string, props: string[], computeProps?:(def:T, res:any)=>any) {
    let filePath = "./public/data/en/" + tableName;
    let defs:{[hash:string]:T} = definitions.data[tableName];
    let data: any = {};
    for (let d in defs) {
        let def = defs[d];
        var res: any = {};
        for (let p in props) {
            let prop = props[p];
            res[prop] = def[prop];
        }
        if(computeProps){
            let computed = computeProps(def, res);
            res = {
                ...computed,
                ...res
            };
        }
        data[d] = res;
    }
    await fs.writeFile(`${filePath}.json`, JSON.stringify(data));
}

async function run(): Promise<void> {
    let definitions = await getManifest();
    await saveItems(definitions, 'DestinyInventoryItemDefinition');
    await saveList<DestinyInventoryItemDefinition>(definitions, 'DestinyInventoryItemDefinition', ['displayProperties', 'itemType', 'hash'], (def, res)=>{
        let entries:DestinyItemSocketEntryDefinition[] = _.get(def, 'sockets.socketEntries', []);
        let hasRandomPerks = _.some(entries, (entry)=>!!entry.randomizedPlugSetHash);
        return {hasRandomPerks:hasRandomPerks};
    });
    await saveItems(definitions, 'DestinyCollectibleDefinition');
    await saveList<DestinyCollectibleDefinition>(definitions, 'DestinyCollectibleDefinition', ['displayProperties', 'itemHash', 'hash']);
    await saveItems(definitions, 'DestinyPlugSetDefinition');
    await saveList<DestinyPresentationNodeDefinition>(definitions, 'DestinyPresentationNodeDefinition', ['displayProperties', 'children', 'hash', 'parentNodeHashes']);
}

run();