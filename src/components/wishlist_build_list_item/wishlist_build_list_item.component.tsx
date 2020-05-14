import { Box, Button, Card, CardActions, colors, createStyles, makeStyles, Theme } from "@material-ui/core";
import { Edit as EditIcon, Delete as DeleteIcon } from "@material-ui/icons";
import React from "react";
import { WishlistBuild } from "../../interfaces/wishlist.interface";
import { InventoryItemImage } from "../inventory_item_image/inventory_item_image.component";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        buildTagPill: {
            padding: "0px 4px",
            borderRadius: 4,
        },
        tagPvE: {
            backgroundColor: colors.blue[600],
        },
        tagPvP: {
            backgroundColor: colors.red[600],
        },
        tagGod: {
            border: `1px solid ${colors.amber[600]}`
        }
    }),
);

export const WishlistBuildListItem = (props: { build: WishlistBuild , onEditClick?:()=>void, onDeleteClick?:()=>void}) => {
    const { build } = props;
    const classes = useStyles();
    return (
        <Card variant="outlined" key={build.id}>
            <Box p={1} pb={0.5} display="flex" width="100%" justifyContent="space-between">
                <Box>
                    <strong>{build.name}</strong>
                </Box>
                <Box display="flex">
                    {build.tags?.map((t) => {
                        let cssClass: string = `${classes.buildTagPill}`;
                        if (t.toLowerCase().indexOf('god') > -1) {
                            cssClass += ` ${classes.tagGod}`;
                        }
                        if (t.toLowerCase().indexOf('pve') > -1) {
                            cssClass += ` ${classes.tagPvE}`;
                        }
                        if (t.toLowerCase().indexOf('pvp') > -1) {
                            cssClass += ` ${classes.tagPvP}`;
                        }
                        return <Box ml={.5} key={t} className={cssClass}>
                            {t}
                        </Box>;
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
                <Button size="small" variant="outlined" onClick={()=>{
                    if(props.onEditClick) props.onEditClick();
                }} startIcon={<EditIcon />}>
                    Edit
                </Button>
                <Button size="small" variant="outlined" 
                onClick={()=>{
                    if(props.onDeleteClick) props.onDeleteClick();
                }}
                startIcon={<DeleteIcon />}>
                    Delete
                </Button>
            </CardActions>
        </Card>);
}