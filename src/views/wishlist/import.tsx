import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppBar, Box, CircularProgress, Container, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import delay from 'delay';
import { parse } from "query-string";
import React, { useEffect, useState } from "react";
import { RouteChildrenProps } from "react-router-dom";
import Wishlist, { WishlistBuild } from "../../interfaces/wishlist.interface";
import { saveBuild } from "../../services/wishlistBuild.service";
import { createWishlist } from "../../services/wishlists.service";
import { importLittleLight } from "../../utils/converters/littlelight.converter";
import { importWishlistFile } from "../../utils/wishlist_loader";
import { ImportWishlistForm, MediaType, OnWishlistImport, WishlistData as WishlistFormData, WishlistType } from "./import/import_form";
import { OnImportFinish, WishlistImporter } from "./import/importer";
import { ImporterMetadataForm } from "./import/importer_metadata_form";


const useStyles = {
    noPadding: {
        padding: 0,
        margin: 0,
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

enum Phase {
    importForm = "import-form",
    importing = "importing",
    metadataForm = "metadataForm",
    saving = "saving"
}

export const ImportWishlist = ({ history, location }: RouteChildrenProps) => {

    const classes = useStyles;
    const [phase, setPhase] = useState<Phase>(Phase.importForm);

    const [formData, setFormData] = useState<WishlistFormData>();
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);

    const [importedData, setImportedData] = useState<{
        wishlist: Wishlist,
        builds: WishlistBuild[]
    }>();

    const loadAndImport = async (data: WishlistFormData) => {
        let fileData = await importWishlistFile(data.media!, data.data!);
        switch (data?.type) {
            case WishlistType.LittleLight:
                return importLittleLight(fileData);
        }
    }

    const importFile: OnWishlistImport = async (data) => {
        setFormData(data);
        setPhase(Phase.importing);
        let importedData = await loadAndImport(data);
        setImportedData(importedData);
        setPhase(Phase.metadataForm);
    }

    const importFinish: OnImportFinish = (data) => {
        setImportedData(data);
        setPhase(Phase.metadataForm);
    };

    const saveToDatabase = async (importedData: any): Promise<Wishlist> => {
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
        return w;
    }

    const onSaveFinish = async () => {
        setPhase(Phase.saving);
        let w = await saveToDatabase(importedData!);
        history.push(`/wishlist/e/${w.id}`);
    }

    const goToMain = () => {
        history.push("/");
    }
    const renderCurrentPhase = () => {
        switch (phase) {
            case Phase.importForm:
                return <ImportWishlistForm
                    data={formData} onImport={importFile}>
                </ImportWishlistForm>;
            case Phase.importing:
                return <WishlistImporter onFinish={importFinish} data={formData}></WishlistImporter>
            case Phase.metadataForm:
                return <ImporterMetadataForm data={importedData} onSave={onSaveFinish}></ImporterMetadataForm>
            case Phase.saving:
                return <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={200} p={4}>
                    <CircularProgress></CircularProgress>
                    <Box pt={2}>Saving...</Box>
                    <Box pt={2}>{`${progress}/${total}`}</Box>
                </Box>;
        }
    }

    useEffect(() => {
        async function checkURL() {
            const urlParams: any = location.search ? parse(location.search) : null;
            const autoImport: boolean = !!urlParams && !!urlParams["type"] && !!urlParams["link"];
            if (!autoImport) return;
            let formData: WishlistFormData = { type: urlParams["type"], media: MediaType.Link, data: urlParams["link"] };
            setFormData(formData);
            await delay(100);
            setPhase(Phase.importing);
            let importedData = await loadAndImport(formData);
            setImportedData(importedData);
            await delay(100);
            setPhase(Phase.saving);
            let w = await saveToDatabase(importedData!);
            history.push(`/wishlist/e/${w.id}`);
        }
        checkURL();
    }, [history, location.search]);
    return (
        <Container maxWidth="sm">
            <Box sx={classes.root}>
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
                        {renderCurrentPhase()}
                    </Box>
                </Paper>
            </Box>
        </Container >);
};