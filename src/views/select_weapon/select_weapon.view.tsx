import React from "react";
import { DataService } from "../../services/data.service";
import { DestinyPresentationNodeDefinition, DestinyCollectibleDefinition } from "bungie-api-ts/destiny2/interfaces";
import { AmmoTypeSelector } from "../../components/ammo_type_selector/ammo_type_selector.component";
import { WeaponTypeSelector } from "../../components/weapon_type_selector/weapon_type_selector.component";

interface SelectWeaponState {
    enabledNodes: { [id: string]: boolean };
    ammoTypeNodes: DestinyPresentationNodeDefinition[];
    weaponTypeNodes: DestinyPresentationNodeDefinition[];
    collectibles: DestinyCollectibleDefinition[];
}

export class SelectWeapon extends React.Component {
    state: SelectWeaponState = {
        enabledNodes: {},
        ammoTypeNodes: [],
        weaponTypeNodes: [],
        collectibles: [],
    };
    constructor(props: any) {
        super(props);
        this.loadData();
    }

    async loadData() {
        let dataService = new DataService();
        let nodes = await dataService.loadPresentationNodes();
        let collectibles = await dataService.loadCollectibles();
        let rootNode = nodes["1528930164"];
        for (let i in rootNode.children.presentationNodes) {
            let child = rootNode.children.presentationNodes[i];
            this.state.enabledNodes[child.presentationNodeHash] = true;
            let ammoNode = nodes[child.presentationNodeHash];
            this.state.ammoTypeNodes.push(ammoNode);

            for (let j in ammoNode.children.presentationNodes) {
                let child = ammoNode.children.presentationNodes[j];
                this.state.enabledNodes[child.presentationNodeHash] = true;
                let weaponTypeNode = nodes[child.presentationNodeHash];
                this.state.weaponTypeNodes.push(weaponTypeNode);
                for (let k in weaponTypeNode.children.collectibles) {
                    let child = weaponTypeNode.children.collectibles[k];
                    let collectible = collectibles[child.collectibleHash];
                    this.state.collectibles.push(collectible);
                }
            }
        }
        this.setState(this.state);
    }

    ammoUpdate = () => {
        this.setState(this.state);
    }

    render() {
        if (!this.state.collectibles) {
            return <div></div>
        }
        return <div>
            <AmmoTypeSelector ammoTypes={this.state.ammoTypeNodes} enabledTypes={this.state.enabledNodes} onChange={this.ammoUpdate}></AmmoTypeSelector>
            <WeaponTypeSelector weaponTypes={this.state.weaponTypeNodes}></WeaponTypeSelector>
        </div>
    }
}