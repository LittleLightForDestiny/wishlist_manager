import { Box, Button, Divider } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { ExtendedCollectible } from "../../services/weapons.service";
import { bungieURL } from "../../utils/bungie_url";

interface WeaponListItemProps {
    definition: ExtendedCollectible
    itemHash: number;
    wishlistId: number;
}

export const WeaponListItem = ({ itemHash, wishlistId, definition }: WeaponListItemProps) => {
    const season = definition?.season
    const confirmed = definition?.confirmed
    const name = definition?.displayProperties?.name
    const icon = definition?.displayProperties?.icon

    return (
        <Button 
        variant="outlined"
        fullWidth 
        style={{ padding: "0", justifyContent: "left"}} 
        component={Link} 
        to={`/wishlist/e/${wishlistId}/item/e/${itemHash}`}
        >
            <img width={64} height={64} alt={name} src={bungieURL(icon)} />
            <Divider flexItem orientation="vertical"></Divider>
            <Box p={1} minWidth={0}>
                <Box whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis"><strong>{name}</strong></Box>
                <div><strong>{season ? `Season ${season}` : null} {!confirmed ? ' (unconfirmed)' : null }</strong></div>
            </Box>
        </Button>
    );
}