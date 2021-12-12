import { Box, Button, Container, Card, CardActionArea, Typography, CardActions, makeStyles, Theme, createStyles, AppBar, Toolbar, Paper, IconButton, useTheme, useMediaQuery, Checkbox, FormControlLabel } from "@material-ui/core";

import React, { useState } from "react";
import Wishlist from "../../interfaces/wishlist.interface";
import * as wishlistService from '../../services/wishlists.service';
import { HashRouter, Link, Route, RouteChildrenProps } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { ExportPackageModal } from "./export";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: "column",
            justifyContent: "center",
            marginLeft: theme.spacing(-2),
            marginRight: theme.spacing(-2),
            // minHeight: '100vh',
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        card: {
            display: 'flex',
            justifyContent: "space-between",
            marginBottom: theme.spacing(1),
        },
        cardActionArea: {
            flexShrink: 1,
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        content: {
            padding: theme.spacing(1),
            paddingBottom: 0,
            background: theme.palette.background.default,
        }
    }),
);

export const PackageIndex = ({ history }: RouteChildrenProps) => {
    const [wishlists, setWishlists] = useState<Wishlist[]>();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles();
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
                <Box className={classes.root} minHeight={isMobile ? "auto" : "100vh"}>
                    <AppBar position="static" >
                        <Toolbar>
                            <IconButton edge="start" color="inherit" aria-label="menu" onClick={goToMain}>
                                <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                            </IconButton>
                            <Typography variant="h6" style={{ flexGrow: 1 }}>
                                Select one or more wishlists to export
                            </Typography>
                            <Button disabled={selectedIds.size <= 0} color="default" variant="contained" component={Link} to={`/package/export`}>Export</Button>
                        </Toolbar>
                    </AppBar>
                    <Paper className={classes.content}>
                        {wishlists.length === 0 ?
                            <Box p={3} textAlign="center">
                                No wishlists to export
                            </Box>
                            :
                            wishlists.map((w) =>
                                <Card key={w.id} className={classes.card} >
                                    <CardActionArea className={classes.cardActionArea}>

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
