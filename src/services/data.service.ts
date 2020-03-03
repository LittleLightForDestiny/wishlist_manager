import Axios from "axios";
import { DestinyInventoryItemDefinition, DestinyPresentationNodeDefinition, DestinyCollectibleDefinition } from "bungie-api-ts/destiny2/interfaces";

export class DataService{
    constructor(){
    }

    async loadPresentationNodes():Promise<{[id:string]:DestinyPresentationNodeDefinition}>{
        var res = await Axios.get("./data/en/DestinyPresentationNodeDefinition.json");
        return res.data;
    }

    async loadCollectibles():Promise<{[id:string]:DestinyCollectibleDefinition}>{
        var res = await Axios.get("./data/en/DestinyCollectibleDefinition.json");
        return res.data;
    }

    async loadInventoryItemList():Promise<{[id:string]:DestinyInventoryItemDefinition}>{
        var res = await Axios.get("./data/en/DestinyInventoryItemDefinition.json");
        return res.data;
    }
}