import { Box, Button, Divider } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { ExtendedCollectible } from "../../services/weapons.service";
import { bungieURL } from "../../utils/bungie_url";
import { Tooltip } from "react-tippy";

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
    const button =
        <Button
            variant="outlined"
            color= {confirmed ? 'primary' : 'error'}
            fullWidth
            sx={{
                padding: 0,
                justifyContent: "left",
                color: confirmed ? 'white' : 'error.light'
            }}
            component={Link}
            to={`/wishlist/e/${wishlistId}/item/e/${itemHash}`}
        >
            <img width={64} height={64} alt={name} src={bungieURL(icon)} />
            <Divider flexItem orientation="vertical"></Divider>
            <Box p={1} minWidth={0}>
                <Box whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis"><strong>{name}</strong></Box>
                <Box whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis"><strong>{season ? `Season ${season}` : null} {!confirmed ? ' (unconfirmed)' : null}</strong></Box>
            </Box>
        </Button>

    if(!confirmed){
        const tooltip = <Box>
            This item wasn't confirmed through collections or craftable items and may not be a real item in the game
        </Box>
        return <Tooltip trigger="mouseenter" html={tooltip} >
            {button}
        </Tooltip>
    }

    return button

}