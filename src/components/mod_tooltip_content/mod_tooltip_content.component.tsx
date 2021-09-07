import { Box, createStyles, makeStyles, Theme, colors } from "@material-ui/core";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";
import React, { useState, useEffect } from "react";
import { manifest } from '../../services';
import { bungieURL } from "../../utils/bungie_url";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
        },
        titlebar:{
            backgroundColor:colors.blueGrey["700"],
            textTransform:"uppercase",
            fontWeight:"bold",
            fontSize:22,
            textAlign:"left",
            padding:theme.spacing(1)
        },
        icon: {
            width: 48,
            height: 48
        },
    }),
);

export const ModTooltipContent = (props: {
    hash: number,
} & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
    const [def, setDef] = useState<DestinyInventoryItemDefinition>();
    let classes = useStyles();
    useEffect(()=>{
        async function load() {
            let d = manifest.getInventoryItemDefinition(props.hash);
            setDef(d);
        }
        load();
    }, [props.hash])
    

    if (!def) {    
        return <Box></Box>
    }
    return <Box className={classes.root}>
        <Box className={classes.titlebar}>
            {def.displayProperties.name}
        </Box>
        <Box display="flex" p={1}>
            <Box flexShrink={0}><img className={classes.icon} src={bungieURL(def.displayProperties.icon)} alt={def.displayProperties.name} /></Box>
            <Box flexShrink={1} textAlign="left">{def.displayProperties.description}</Box>
        </Box>
    </Box>;
}