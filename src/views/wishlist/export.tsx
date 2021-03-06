import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppBar, Box, Button, Card, createStyles, FormControlLabel, IconButton, makeStyles, Radio, RadioGroup, Theme, Toolbar, Typography, Paper, CircularProgress } from "@material-ui/core";
import React, { useState } from "react";
import { DefaultModal } from "../../components/default_modal/defaultModal.component";
import { WishlistType } from "./import/import_form";
import { RouteChildrenProps } from "react-router-dom";
import { exportLittleLight } from "../../utils/converters/littlelight.converter";
import { getWishlist } from "../../services/wishlists.service";
import { exportDIM } from "../../utils/converters/dim.converter";
import { exportCSV } from "../../utils/converters/csv.converter";
import { saveAs } from 'file-saver';
import { exportXLS } from "../../utils/converters/xls.converter";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            display: "flex",
            justifyContent: "space-between",
        },
        root: {
            display: 'flex',
            minHeight: '100vh',
            flexDirection: "column",
            justifyContent: "center",
            padding: theme.spacing(0),
        },
        card: {
            display: 'flex',
            marginBottom: theme.spacing(1),
        },
        content: {
            padding: theme.spacing(2)
        }
    }),
);


export const ExportWishlistModal = ({ match, history }: RouteChildrenProps) => {
    let { wishlistId } = match!.params as any;
    const [wishlistType, setWishlistType] = useState<WishlistType | null>(null);
    const [working, setWorking] = useState<boolean>(false);
    const classes = useStyles();

    function exportButtonEnabled() {
        return wishlistType !== null;
    }

    function close() {
        history.replace(`/wishlist/e/${wishlistId}`);
    }

    async function exportWishlist() {
        setWorking(true);
        let wishlist = await getWishlist(parseInt(wishlistId));
        let filename = "";
        let extension = "";
        let data: Blob | null = null;
        switch (wishlistType) {
            case WishlistType.LittleLight:
                data = await exportLittleLight(parseInt(wishlistId));
                console.log(wishlist);
                filename = (wishlist?.name || "wishlist").replace(/.(json|txt)$/, "");
                extension = 'json';
                break;
            case WishlistType.DIM:
                data = await exportDIM(parseInt(wishlistId));
                filename = (wishlist?.name || "wishlist").replace(/.(json|txt)$/, "");
                extension = 'txt';
                break;
            case WishlistType.CSV:
                data = await exportCSV(parseInt(wishlistId));
                filename = (wishlist?.name || "wishlist").replace(/.(json|txt)$/, "");
                extension = 'csv';
                break;

            case WishlistType.XLS:
                data = await exportXLS(parseInt(wishlistId));
                filename = (wishlist?.name || "wishlist").replace(/.(json|txt)$/, "");
                extension = 'xlsx';
                break;
        }
        if (!data) return;

        saveAs(data, `${filename}.${extension}`);

        setWorking(false);
        close();
    }

    return (
        <DefaultModal width={400} display="flex" flexDirection="column">
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>
                    <Typography>Export Wishlist</Typography>
                    <IconButton edge="end" color="inherit" aria-label="menu" onClick={close}>
                        <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Paper>
                {working ?
                    <Box p={2} display="flex" flexDirection="column" alignItems="center">
                        <CircularProgress></CircularProgress>
                        <Box pt={2}>Exporting</Box>
                    </Box>
                    :
                    <Box p={2}>
                        <Box m={1} mb={.5} mt={0}>
                            <Typography>Wishlist Type</Typography>
                        </Box>
                        <Card variant="outlined">
                            <RadioGroup aria-label="wishlist type" name="wishlist type"
                                value={wishlistType}
                                style={{ display: "flex", flexDirection: "row", padding: "8px 16px" }}
                                onChange={(_, value) => setWishlistType(value as any)}>
                                <FormControlLabel value={WishlistType.LittleLight} control={<Radio />} label="Little Light" />
                                <FormControlLabel value={WishlistType.DIM} control={<Radio />} label="DIM" />
                                <FormControlLabel value={WishlistType.CSV} control={<Radio />} label="CSV" />
                                <FormControlLabel value={WishlistType.XLS} control={<Radio />} label="XLS" />
                            </RadioGroup>
                        </Card>
                        <Box pt={2} display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    exportWishlist();
                                }}
                                component="span"
                                disabled={!exportButtonEnabled()}>
                                Export
                            </Button>
                        </Box>
                    </Box>
                }
            </Paper>
        </DefaultModal>);
};