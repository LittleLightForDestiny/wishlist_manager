import { faCopy, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Card, CardActions, colors, styled } from "@mui/material";
import React from "react";
import { WishlistBuild } from "../../interfaces/wishlist.interface";
import { InventoryItemImage } from "../inventory_item_image/inventory_item_image.component";

const BuildTagPill = styled(Box)(() => ({
    padding: "0px 4px",
    borderRadius: 4,
}))

const StylesPVE = {
    backgroundColor: colors.blue[600]
}

const StylesPVP = {
    backgroundColor: colors.red[600]
}

const StylesGodRoll = {
    border: `1px solid ${colors.amber[600]}`
}

const ActionButton = styled(Button)(() => ({
    color:colors.blueGrey[100],
    borderColor:colors.blueGrey[200],
    '&:hover':{
        borderColor:colors.blueGrey[100],
    }
}))


export const WishlistBuildListItem = (props: { build: WishlistBuild, selected?: boolean, onEditClick?: () => void, onCopyClick?: () => void, onDeleteClick?: () => void }) => {
    const { build } = props;
    return (
        <Card variant="outlined" style={{
            backgroundColor: props.selected ? colors.blueGrey[800] : "transparent"
        }} key={build.id}>
            <Box p={1} pb={0.5} display="flex" width="100%" justifyContent="space-between">
                <Box>
                    <strong>{build.name}</strong>
                </Box>
                <Box display="flex">
                    {build.tags?.map((t) => {
                        let sx = {}
                        if (t.toLowerCase().indexOf('god') > -1) {
                            sx = {...sx, ...StylesGodRoll}
                        }
                        if (t.toLowerCase().indexOf('pve') > -1) {
                            sx = {...sx, ...StylesPVE}
                        }
                        if (t.toLowerCase().indexOf('pvp') > -1) {
                            sx = {...sx, ...StylesPVP}
                        }
                        return <BuildTagPill ml={.5} key={t} sx={sx}>
                            {t}
                        </BuildTagPill>;
                    })}
                </Box>
            </Box>
            <Box px={1} display="flex">
                {build.plugs?.map((p, index) => {
                    return <Box key={index} width={24}>
                        {p.map((hash) => {
                            return <InventoryItemImage key={hash} width={24} hash={hash} />;
                        })}
                    </Box>
                })}
            </Box>
            <CardActions style={{ justifyContent: "flex-end" }}>
                <ActionButton size="small" variant="outlined" onClick={() => {
                    if (props.onCopyClick) props.onCopyClick();
                }} startIcon={<FontAwesomeIcon icon={faCopy} fontSize="5px" />}>
                    Copy
                </ActionButton>
                <ActionButton size="small" variant="outlined" onClick={() => {
                    if (props.onEditClick) props.onEditClick();
                }} startIcon={<FontAwesomeIcon icon={faEdit} />}>
                    Edit
                </ActionButton>
                <ActionButton size="small" variant="contained"
                    color="error"
                    onClick={() => {
                        if (props.onDeleteClick) props.onDeleteClick();
                    }}
                    startIcon={<FontAwesomeIcon icon={faTrash} />}>
                    Delete
                </ActionButton>
            </CardActions>
        </Card>);
}