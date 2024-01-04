import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppBar, Box, Button, Card, Checkbox, CircularProgress, FormControlLabel, IconButton, Paper, TextField, Toolbar, Typography } from "@mui/material";
import { saveAs } from 'file-saver';
import React, { useState } from "react";
import { RouteChildrenProps } from "react-router-dom";
import { DefaultModal } from "../../components/default_modal/defaultModal.component";
import { exportPackageAsLittleLightWishlist } from "../../utils/converters/littlelight.converter";


const useStyles = {
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
    },
    root: {
        display: 'flex',
        minHeight: '100vh',
        flexDirection: "column",
        justifyContent: "center",
        padding: 0,
    },
    card: {
        display: 'flex',
        marginBottom: 1,
    },
    content: {
        padding: 2,
    }
}

type ExportPackageModalProps = {
    wishlistIds: Set<number>
};

export const ExportPackageModal = (props: RouteChildrenProps & ExportPackageModalProps) => {
    const [working, setWorking] = useState<boolean>(false);
    const [omitDescriptions, setOmitDescriptions] = useState<boolean>(false);
    const [prettyPrint, setPrettyPrint] = useState<boolean>(false);
    const [wishlistName, setWishlistName] = useState<String>("");
    const [wishlistDescription, setWishlistDescription] = useState<String>("");
    const classes = useStyles;

    function exportButtonEnabled() {
        return true;
    }

    function close() {
        props.history.replace(`/package`);
    }

    async function exportWishlist() {
        setWorking(true);
        let filename = "";
        let extension = "";
        let data: Blob | null = null;

        data = await exportPackageAsLittleLightWishlist(wishlistName, wishlistDescription, Array.from(props.wishlistIds), {
            JSONPrettyPrint: prettyPrint,
            omitDescriptions: omitDescriptions
        });

        filename = (wishlistName || "wishlist").replace(/.(json|txt)$/, "");
        extension = 'json';

        if (!data) return;

        saveAs(data, `${filename}.${extension}`);

        setWorking(false);
        close();
    }

    return (
        <DefaultModal width={400} display="flex" flexDirection="column">
            <AppBar position="static">
                <Toolbar sx={classes.toolbar}>
                    <Typography>Export Package</Typography>
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

                        <form noValidate autoComplete="off" style={{ width: "100%" }}>
                            <Box pb={1}>
                                <TextField id="name" label="Name" variant="outlined" value={wishlistName} fullWidth onChange={(event) => setWishlistName(event.target.value)} />
                            </Box>
                            <Box pb={1}>
                                <TextField id="description" label="Description" variant="outlined" value={wishlistDescription} fullWidth multiline rows={3} onChange={(event) => setWishlistDescription(event.target.value)} />
                            </Box>
                        </form>

                        <Card variant="outlined">
                            <Box px={2} py={1}>
                                <FormControlLabel value={omitDescriptions} control={<Checkbox />} label="Omit descriptions" onChange={(_, value) => setOmitDescriptions(value)} />
                                <FormControlLabel value={prettyPrint} control={<Checkbox />} label="JSON pretty print" onChange={(_, value) => setPrettyPrint(value)} />
                            </Box>
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