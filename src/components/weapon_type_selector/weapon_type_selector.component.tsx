import React from "react";
import { DestinyPresentationNodeDefinition } from "bungie-api-ts/destiny2/interfaces";
import { ButtonGroup, Button } from "@material-ui/core";

export interface WeaponTypeSelectorProps{
    weaponTypes:DestinyPresentationNodeDefinition[];
}

export class WeaponTypeSelector extends React.Component<WeaponTypeSelectorProps> {
    constructor(props: WeaponTypeSelectorProps) {
        super(props);
    }
    render() {
        return <ButtonGroup orientation="vertical">
            {this.props.weaponTypes.map((type)=>this.buildWeaponTypeButton(type))}
        </ButtonGroup>
    }

    buildWeaponTypeButton(type: DestinyPresentationNodeDefinition) {
        return <Button key={type.hash}>
            {type.displayProperties.name}
        </Button>;
    }
}