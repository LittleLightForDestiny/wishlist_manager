import { Button, ButtonGroup, ButtonGroupProps } from "@material-ui/core";
import { DestinyPresentationNodeDefinition } from "bungie-api-ts/destiny2/interfaces";
import { intersection } from "lodash";
import React from "react";

export interface WeaponTypeSelectorProps extends ButtonGroupProps {
    presentationNodes: DestinyPresentationNodeDefinition[];
    enabledHashes: Set<number>;
    filterToggle:(hash:number, on:boolean)=>void;
}

export const WeaponTypeSelector = (props: WeaponTypeSelectorProps) => {
    const buildWeaponTypeButton = (type: DestinyPresentationNodeDefinition) => {
        let enabled = props.enabledHashes.has(type.hash);
        return <Button key={type.hash} variant={enabled ? "contained" : "outlined"} color={enabled ? "primary" : undefined} onClick={()=>props.filterToggle(type.hash, !enabled)}>
            {type.displayProperties.name}
        </Button>;
    }
    let { 
        presentationNodes, 
        enabledHashes,
        filterToggle,
        ...buttonProps } = props;
    return <ButtonGroup orientation="vertical" {...buttonProps} >
        {props.presentationNodes.filter((p) => {
            let i = intersection(p.parentNodeHashes, Array.from(props.enabledHashes.values()));
            return i.length > 0;
        }).map((type) => buildWeaponTypeButton(type))}
    </ButtonGroup>
}