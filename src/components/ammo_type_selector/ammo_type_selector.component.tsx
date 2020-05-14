import { Button, ButtonGroup } from "@material-ui/core";
import { DestinyPresentationNodeDefinition } from "bungie-api-ts/destiny2/interfaces";
import React from "react";
import { bungieURL } from "../../utils/bungie_url";
import './ammo_type_selector.scss';


const rootNodeHash = 1528930164;

export interface AmmoTypeSelectorProps{
    presentationNodes:DestinyPresentationNodeDefinition[];
    enabledHashes:Set<number>;
    filterToggle:(hash:number, on:boolean)=>void;
}

export const AmmoTypeSelector = (props:AmmoTypeSelectorProps)=>{
    
    const buildAmmoTypeButton = (type: DestinyPresentationNodeDefinition) => {
        let enabled = props.enabledHashes.has(type.hash);
        return <Button key={type.hash} variant={enabled ? "contained" : "outlined"} color={enabled ? "primary" : undefined} onClick={()=>props.filterToggle(type.hash, !enabled)}>
            <img alt={type.displayProperties.name} className="ammo-type-image" src={bungieURL(type.displayProperties.icon)} />
        </Button>;
    }

    return (<ButtonGroup>
            {props.presentationNodes.filter(
                (p)=>p.parentNodeHashes && p.parentNodeHashes.indexOf(rootNodeHash) > -1
            ).map((type)=>buildAmmoTypeButton(type))}
        </ButtonGroup>);
}