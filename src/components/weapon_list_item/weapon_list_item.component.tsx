import { Box, Button, Divider } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bungieURL } from "../../utils/bungie_url";
import { manifest, weapons } from "../../services";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";

interface WeaponListItemProps {
    itemHash: number;
    wishlistId: number;
}

export const WeaponListItem = ({ itemHash, wishlistId }: WeaponListItemProps) => {
    let [def, setDef] = useState<DestinyInventoryItemDefinition>();
    let [season, setSeason] = useState<number>();
    useEffect(() => {
        async function load() {
            let def = manifest.getInventoryItemDefinition(itemHash);
            let season = await weapons.getSeasonByItemHash(itemHash);
            setDef(def);
            setSeason(season);
        }
        load();
    }, [itemHash]);

    if (!def) {
        return <Box></Box>;
    }

    return (
        <Button variant="outlined" fullWidth style={{ padding: "0", justifyContent: "left" }} component={Link} to={`/wishlist/e/${wishlistId}/item/e/${itemHash}`}>
            <img width={64} height={64} alt={def.displayProperties.name} src={bungieURL(def.displayProperties.icon)} />
            <Divider flexItem orientation="vertical"></Divider>
            <Box p={1} minWidth={0}>
                <Box whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis"><strong>{def.displayProperties.name}</strong></Box>
                {season ? <div><strong>Season {season}</strong></div> : null}
                {/* <div>{def.hasRandomPerks ? "has random rolls" : " "}</div> */}
            </Box>
        </Button>
    );
}