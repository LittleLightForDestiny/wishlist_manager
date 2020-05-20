import { AppBar, Box, Button, Card, CardMedia, createStyles, CssBaseline, Grid, IconButton, makeStyles, Theme, Toolbar, Typography } from "@material-ui/core";
import { Close as CloseIcon } from '@material-ui/icons';
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";
import React, { useEffect, useState } from "react";
import { Link, RouteChildrenProps } from "react-router-dom";
import ScrollContainer from "react-scrollbars-custom";
import { DefaultModal } from "../../components/default_modal/defaultModal.component";
import { SectionHeader } from "../../components/section_header/section_header.component";
import { WishlistBuildListItem } from "../../components/wishlist_build_list_item/wishlist_build_list_item.component";
import { WishlistBuild } from "../../interfaces/wishlist.interface";
import { loadInventoryItemDefinition } from "../../services/data.service";
import db from '../../services/database.service';
import { getBuilds, deleteBuild } from "../../services/wishlistBuild.service";
import { bungieURL } from "../../utils/bungie_url";
import WishlistBuildForm from "../build/buildForm";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            paddingRight: theme.spacing(1),
        },
    }),
);

export const EditItem = ({ match, history }: RouteChildrenProps<{ itemHash: string, wishlistId: string }>) => {
    const itemHash: number = parseInt(match?.params["itemHash"] || "");
    const wishlistId: number = parseInt(match?.params["wishlistId"] || "");
    const classes = useStyles();
    const [definition, setDefinition] = useState<DestinyInventoryItemDefinition>();
    const [builds, setBuilds] = useState<WishlistBuild[]>();
    const [selectedBuild, setSelectedBuild] = useState<WishlistBuild>();

    useEffect(() => {
        async function refreshBuilds() {
            console.log('refresh builds', wishlistId, itemHash);
            let builds = await getBuilds(wishlistId, itemHash);
            setBuilds(builds);
        }

        async function load() {
            let def = await loadInventoryItemDefinition(itemHash);
            setDefinition(def);
            refreshBuilds();
        }
        load();

        async function onDbChanges(changes: any) {
            refreshBuilds();
        }

        db.on('changes', onDbChanges);

        return () => {
            db.on('changes').unsubscribe(onDbChanges);
        };
    }, [itemHash, wishlistId]);

    if (!definition) {
        return <Box></Box>
    }

    return (<DefaultModal display="flex" flexDirection="column" width="calc(100vw - 80px)" height="calc(100vh - 80px)">
        <CssBaseline />
        <AppBar position="static">
            <Toolbar className={classes.toolbar}>
                <Typography variant="h6" noWrap>
                    {definition.displayProperties.name}
                </Typography>
                <Box flex={1}></Box>
                <IconButton component={Link} to={`/wishlist/e/${wishlistId}/`}>
                    <CloseIcon></CloseIcon>
                </IconButton>
            </Toolbar>
        </AppBar>
        <Box position="relative" flex={1} height="100%" p={2} pb={0}>
            <Grid container spacing={2} style={{ height: "100%" }}>
                <Grid item md={4} style={{ height: "100%" }}>
                    <Card style={{ height: "100%" }}>
                        <ScrollContainer disableTracksWidthCompensation={true}>
                            <CardMedia
                                component="img"
                                style={{ width: "100%" }}
                                image={bungieURL(definition.screenshot)}
                                title={definition.displayProperties.name}
                            />
                            <Box p={1}>
                                <Box mr={1}>
                                    <SectionHeader>
                                        Builds
                            </SectionHeader>
                                </Box>

                                <Box mr={1}>
                                    {builds?.map((b) => {
                                        return (
                                            <Box mb={1} key={b.id}>
                                                <WishlistBuildListItem build={b} 
                                                onEditClick={()=>{
                                                    setSelectedBuild(b);
                                                }}
                                                onDeleteClick={()=>{
                                                    let confirmation = window.confirm(`Do you really want to delete ${b.name ?? 'unnamed'} build?`);
                                                    if(!confirmation || !b.id) return;
                                                    deleteBuild(b.id);
                                                }}
                                                ></WishlistBuildListItem>
                                            </Box>);
                                    })}
                                    <Box mb={1}>
                                        <Button variant="contained" color="primary" fullWidth
                                        onClick={()=>setSelectedBuild(undefined)}
                                        >New Build</Button>
                                    </Box>
                                </Box>
                            </Box>
                        </ScrollContainer>
                    </Card>
                </Grid>
                <Grid item md={8}>
                    <WishlistBuildForm wishlistId={wishlistId} def={definition} build={selectedBuild}></WishlistBuildForm>
                </Grid>
            </Grid>
        </Box>
    </DefaultModal>);
};