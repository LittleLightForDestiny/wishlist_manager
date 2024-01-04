import { AppBar, Box, Button, Card, CardActionArea, Checkbox, Container, FormControlLabel, IconButton, Paper, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";

import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { HashRouter, Link, Route, RouteChildrenProps } from "react-router-dom";
import Wishlist from "../../interfaces/wishlist.interface";
import * as wishlistService from '../../services/wishlists.service';
import { ExportPackageModal } from "./export";

const useStyles = {
        root: {
            display: 'flex',
            flexDirection: "column",
            justifyContent: "center",
            marginLeft: -2,
            marginRight: -2,
            // minHeight: '100vh',
        },
        menuButton: {
            marginRight: 2,
        },
        card: {
            display: 'flex',
            justifyContent: "space-between",
            marginBottom: 1,
        },
        cardActionArea: {
            flexShrink: 1,
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        content: {
            padding: 1,
            paddingBottom: 0,
            background: 'background.default',
        }
    }

export const PackageIndex = ({ history }: RouteChildrenProps) => {
    const [wishlists, setWishlists] = useState<Wishlist[]>();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles;
    async function load() {
        let w = await wishlistService.getAllWishlists();
        setWishlists(w);
    }

    if (!wishlists) {
        load();
        return <Box></Box>;
    }

    const goToMain = () => {
        history.push("/");
    }

    const isSelected = (id: number) => {
        return selectedIds.has(id);
    }
    const setSelected = (id: number, value: boolean) => {
        if (value) {
            selectedIds.add(id);
        } else {
            selectedIds.delete(id);
        }
        setSelectedIds(new Set(selectedIds));
    }

    return (
        <>
            <HashRouter>
                <Route exact path="/package/export" render={props=><ExportPackageModal {...props} wishlistIds={selectedIds}/>}></Route>
            </HashRouter>
            <Container maxWidth="sm">
                <Box sx={classes.root} minHeight={isMobile ? "auto" : "100vh"}>
                    <AppBar position="static" >
                        <Toolbar>
                            <IconButton edge="start" color="inherit" aria-label="menu" onClick={goToMain}>
                                <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                            </IconButton>
                            <Typography variant="h6" style={{ flexGrow: 1 }}>
                                Select one or more wishlists to export
                            </Typography>
                            <Button disabled={selectedIds.size <= 0} color="primary" variant="contained" component={Link} to={`/package/export`}>Export</Button>
                        </Toolbar>
                    </AppBar>
                    <Paper sx={classes.content}>
                        {wishlists.length === 0 ?
                            <Box p={3} textAlign="center">
                                No wishlists to export
                            </Box>
                            :
                            wishlists.map((w) =>
                                <Card key={w.id} sx={classes.card} >
                                    <CardActionArea sx={classes.cardActionArea}>

                                        <Box p={2} flexGrow="0" flexShrink="1" overflow="hidden">
                                            <FormControlLabel control={<Checkbox />} label={<>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    {w.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" component="p">
                                                    {w.description}
                                                </Typography>
                                            </>} value={isSelected(w.id)}
                                                onChange={(_, checked) => setSelected(w.id, checked)} />
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            )}
                    </Paper>
                </Box>
            </Container>
        </>);
};
