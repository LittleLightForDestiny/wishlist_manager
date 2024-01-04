import { Box, colors } from "@mui/material";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";
import React, { useEffect, useState } from "react";
import { manifest } from '../../services';
import { bungieURL } from "../../utils/bungie_url";

const useStyles = {
    root: {
    },
    titlebar: {
        backgroundColor: colors.blueGrey["700"],
        textTransform: "uppercase",
        fontWeight: "bold",
        fontSize: 22,
        textAlign: "left",
        padding: 1
    },
    icon: {
        width: 48,
        height: 48
    },
}

export const ModTooltipContent = (props: {
    hash: number,
} & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
    const [def, setDef] = useState<DestinyInventoryItemDefinition>();
    let classes = useStyles;
    useEffect(() => {
        async function load() {
            let d = manifest.getInventoryItemDefinition(props.hash);
            setDef(d);
        }
        load();
    }, [props.hash])


    if (!def) {
        return <Box></Box>
    }
    return <Box sx={classes.root}>
        <Box sx={classes.titlebar}>
            {def.displayProperties.name}
        </Box>
        <Box display="flex" p={1}>
            <Box flexShrink={0}>
                <img
                    width="48px"
                    height="48px"
                    src={bungieURL(def.displayProperties.icon)} alt={def.displayProperties.name} />
            </Box>
            <Box flexShrink={1} textAlign="left">{def.displayProperties.description}</Box>
        </Box>
    </Box>;
}