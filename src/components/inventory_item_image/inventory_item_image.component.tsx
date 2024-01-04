import React, { useState } from "react";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";
import { manifest } from '../../services';
import { Box } from "@mui/material";
import { bungieURL } from "../../utils/bungie_url";



export const InventoryItemImage = (props: {
    hash: number,
    resolveUrlFn?: (def: DestinyInventoryItemDefinition) => string
} & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
    const [def, setDef] = useState<DestinyInventoryItemDefinition>();

    async function load() {
        let d = manifest.getInventoryItemDefinition(props.hash);
        setDef(d);
    }

    if (!def) {
        load();
        return <Box></Box>
    }
    let url = def.displayProperties.icon;
    if (props.resolveUrlFn) {
        url = props.resolveUrlFn(def);
    }
    return <img src={bungieURL(url)} alt={def.displayProperties.name} {...props} />;
}