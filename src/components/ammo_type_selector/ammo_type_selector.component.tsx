import React from "react";
import { DestinyPresentationNodeDefinition } from "bungie-api-ts/destiny2/interfaces";
import { bungieURL } from "../../utils/bungie_url";

import { ButtonGroup, Button } from "@material-ui/core";
import './ammo_type_selector.scss';

export interface AmmoTypeSelectorProps{
    ammoTypes:DestinyPresentationNodeDefinition[];
    enabledTypes:{[id:string]:boolean};
    onChange?:()=>void;
}

export class AmmoTypeSelector extends React.Component<AmmoTypeSelectorProps> {
    constructor(props: AmmoTypeSelectorProps) {
        super(props);
    }
    render() {
        return <ButtonGroup color="primary">
            {this.props.ammoTypes.map((type)=>this.buildAmmoTypeButton(type))}
        </ButtonGroup>
    }

    buildAmmoTypeButton(type: DestinyPresentationNodeDefinition) {
        let enabled = !!this.props.enabledTypes[type.hash];
        return <Button key={type.hash} variant={enabled ? "contained" : "outlined"} color="primary" onClick={()=>this.toggle(type)}>
            <img className="ammo-type-image" src={bungieURL(type.displayProperties.icon)} />
        </Button>;
    }

    toggle(type: DestinyPresentationNodeDefinition){
        this.props.enabledTypes[type.hash] = !this.props.enabledTypes[type.hash];
        if(this.props.onChange){
            this.props.onChange();
        }
    }
}