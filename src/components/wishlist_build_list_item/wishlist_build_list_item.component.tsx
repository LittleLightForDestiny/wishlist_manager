import { Box, Button, Card, CardActions, colors, createStyles, makeStyles, Theme } from "@material-ui/core";
import React from "react";
import { WishlistBuild } from "../../interfaces/wishlist.interface";
import { InventoryItemImage } from "../inventory_item_image/inventory_item_image.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCopy, faEdit } from "@fortawesome/free-solid-svg-icons";

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

export const WishlistBuildListItem = (props: { build: WishlistBuild , selected?:boolean, onEditClick?:()=>void, onCopyClick?:()=>void, onDeleteClick?:()=>void}) => {
    const { build } = props;
    const classes = useStyles();
    return (
        <Card variant="outlined" style={{
            backgroundColor:props.selected ? colors.blueGrey[800] : "transparent"
        }} key={build.id}>
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
                    if(props.onCopyClick) props.onCopyClick();
                }} startIcon={<FontAwesomeIcon icon={faCopy} fontSize="5px" />}>
                    Copy
                </Button>
                <Button size="small" variant="outlined" onClick={()=>{
                    if(props.onEditClick) props.onEditClick();
                }} startIcon={<FontAwesomeIcon icon={faEdit} />}>
                    Edit
                </Button>
                <Button size="small" variant="outlined" 
                onClick={()=>{
                    if(props.onDeleteClick) props.onDeleteClick();
                }}
                startIcon={<FontAwesomeIcon icon={faTrash} />}>
                    Delete
                </Button>
            </CardActions>
        </Card>);
}