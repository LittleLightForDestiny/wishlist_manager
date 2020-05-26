import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppBar, Box, Container, createStyles, IconButton, makeStyles, Paper, Theme, Toolbar, Typography, CircularProgress } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { RouteChildrenProps } from "react-router-dom";
import Wishlist, { WishlistBuild } from "../../interfaces/wishlist.interface";
import { saveBuild } from "../../services/wishlistBuild.service";
import { createWishlist } from "../../services/wishlists.service";
import { OnImportFinish, WishlistImporter } from "./import/importer";
import { ImporterMetadataForm } from "./import/importer_metadata_form";
import { ImportWishlistForm, OnWishlistImport, WishlistData as WishlistFormData, MediaType, WishlistType } from "./import/import_form";
import { parse } from "query-string";
import { importWishlistFile } from "../../utils/wishlist_loader";
import { importLittleLight } from "../../utils/converters/littlelight.converter";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        noPadding: {
            padding: 0,
            margin: 0,
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

enum Phase {
    importForm = "import-form",
    importing = "importing",
    metadataForm = "metadataForm",
    saving = "saving"
}

export const ImportWishlist = ({ history, location }: RouteChildrenProps) => {

    const classes = useStyles();
    const [phase, setPhase] = useState<Phase>(Phase.importForm);

    const [formData, setFormData] = useState<WishlistFormData>();
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);

    const [importedData, setImportedData] = useState<{
        wishlist: Wishlist,
        builds: WishlistBuild[]
    }>();

    const importFile: OnWishlistImport = async (data) => {
        setFormData(data);
        setPhase(Phase.importing);

        let fileData = await importWishlistFile(data.media!, data.data!);
        switch (data?.type) {
            case WishlistType.LittleLight:
                importFinish(importLittleLight(fileData));
        }
    }

    const importFinish: OnImportFinish = (data) => {
        setImportedData(data);
        setPhase(Phase.metadataForm);
    };

    const onSaveFinish = async () => {
        setPhase(Phase.saving);
        setTotal(importedData?.builds?.length || 0);
        let w = await createWishlist(importedData?.wishlist!);
        for (let i in importedData?.builds) {
            let build = importedData?.builds[parseInt(i)];
            await saveBuild({
                wishlistId: w.id,
                ...build
            });
            setProgress(parseInt(i));
        }
        history.push(`/wishlist/e/${w.id}`);
    }

    const goToMain = () => {
        history.push("/");
    }

    useEffect(() => {
        const urlParams: any = location.search ? parse(location.search) : null;
        const autoImport: boolean = urlParams && urlParams["type"] && urlParams["link"];
        if (autoImport) {
            importFile({ type: urlParams["type"], data: urlParams["link"], media: MediaType.Link });
        };
    }, [location.search]);

    return (
        <Container maxWidth="sm">
            <Box className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={goToMain}>
                            <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                        </IconButton>
                        <Typography>Import Wishlist</Typography>
                    </Toolbar>
                </AppBar>
                <Paper>
                    <Box p={2}>
                        {() => {
                            switch (phase) {
                                case Phase.importForm:
                                    return <ImportWishlistForm data={formData} onImport={importFile}></ImportWishlistForm>;
                                case Phase.importing:
                                    return <WishlistImporter onFinish={importFinish} data={formData}></WishlistImporter>
                                case Phase.metadataForm:
                                    return <ImporterMetadataForm data={importedData} onSave={onSaveFinish}></ImporterMetadataForm>
                                case Phase.saving:
                                    return <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={200} p={4}>
                                        <CircularProgress></CircularProgress>
                                        <Box pt={2}>Saving...</Box>
                                        <Box pt={2}>{`${progress}/${total}`}</Box>
                                    </Box>
                            }
                        }}
                    </Box>
                </Paper>
            </Box>
        </Container >);
};