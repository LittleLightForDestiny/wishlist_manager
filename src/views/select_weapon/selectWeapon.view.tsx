/* eslint-disable */
import { AppBar, Box, createStyles, CssBaseline, alpha, IconButton, InputBase, makeStyles, Paper, Switch, Theme, Toolbar, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { Close as CloseIcon, Search as SearchIcon, SentimentSatisfiedRounded } from '@material-ui/icons';
import React, { useEffect, useMemo, useState } from "react";
import { Link, RouteChildrenProps } from "react-router-dom";
import ScrollContainer from 'react-scrollbars-custom';
import { CollectibleList } from "../../components/collectible_list/collectible_list.component";
import { DefaultModal } from "../../components/default_modal/defaultModal.component";
import { SeasonSelector } from "../../components/season_selector/season_selector.component";
import { WeaponTypeSelector } from "../../components/weapon_type_selector/weapon_type_selector.component";
import useDebounce from "../../hooks/useDebounce.hook";
import { ExtendedCollectible, getFilterableWeapons } from "../../services/weapons.service";

interface WeaponSearchData {
    collectibles: ExtendedCollectible[];
    types: Set<string>;
    seasons: Set<number>;
}

async function loadSearchData(): Promise<WeaponSearchData> {
    let collectibles = await getFilterableWeapons();
    let types = new Set<string>();
    let seasons = new Set<number>();
    collectibles.forEach((c) => {
        if (c.item?.itemTypeDisplayName) {
            types.add(c.item.itemTypeDisplayName);
        }
        if (c.season) {
            seasons.add(c.season);
        }

    });
    collectibles = collectibles.sort((a, b) => {
        let diff = b.season - a.season;
        if (diff != 0) return diff;
        diff = a.item.itemTypeAndTierDisplayName.localeCompare(b.item.itemTypeAndTierDisplayName);
        if (diff != 0) return diff;
        return a.displayProperties.name > b.displayProperties.name ? 1 : -1;
    });
    return {
        collectibles,
        types,
        seasons
    }
}

const drawerWidth = 340;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        drawer: {
            position: "relative",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            width: drawerWidth,
            flexShrink: 0,
            height: "100%",
            padding: theme.spacing(1),
            background: theme.palette.primary.dark,
        },
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
            },
            marginRight: theme.spacing(2),
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(3),
                width: 'auto',
            },
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
        weaponTypeList: {
            flexGrow: 1,
        },
        weaponTypes: {
            width: "100%"
        },
        content: {
            flexGrow: 1,
            backgroundColor: theme.palette.background.default,
            padding: theme.spacing(3),
        },
        toolbar: {
            paddingRight: theme.spacing(1),
        }
    }),
);

export const SelectWeapon = ({ match }: RouteChildrenProps) => {
    const params = match!.params as any;
    const wishlistId = params.wishlistId;
    const classes = useStyles();
    const [selectedWeaponType, setSelectedType] = useState<string>();
    const [selectedSeason, setSelectedSeason] = useState<number>(-1);
    const [onlyRandomRolls, setOnlyRandomRolls] = useState<boolean>(false);
    const [textSearch, setTextSearch] = useState<string>("");
    const debouncedSearchTerm = useDebounce(textSearch, 500);
    const [data, setData] = useState<WeaponSearchData>();
    const [filteredCollectibles, setFilteredCollectibles] = useState<ExtendedCollectible[]>([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));


    const filterCollectibles = () => {
        setFilteredCollectibles(data?.collectibles?.filter((c) => {
            let textMatch = c.displayProperties.name.toLowerCase().indexOf(textSearch.toLowerCase()) > -1;
            let typeMatch = !selectedWeaponType || c.item?.itemTypeDisplayName.toLowerCase() === selectedWeaponType.toLowerCase();
            let seasonMatch = selectedSeason < 0 || c.season === selectedSeason;
            return textMatch && typeMatch && seasonMatch;
        }) ?? []);
    }

    useEffect(() => {
        filterCollectibles();
    }, [debouncedSearchTerm, selectedWeaponType, onlyRandomRolls]);

    useEffect(() => {
        async function load() {
            let data = await loadSearchData();
            setData(data);
            setFilteredCollectibles(data.collectibles);
        }
        load();
    }, []);
    return (<DefaultModal display="flex" flexDirection="row" width={isMobile ? '100vw' : "calc(100vw - 80px)"} height={isMobile ? '100vh' : "calc(100vh - 80px)"}>
        <CssBaseline />
        {useMemo(() => {
            return isMobile ? <Box></Box> : (<Paper square elevation={5} className={classes.drawer}>
                <Box pt={1}></Box>
                <ScrollContainer className={classes.weaponTypeList} disableTracksWidthCompensation={true} >
                    <WeaponTypeSelector className={classes.weaponTypes} weaponTypes={data?.types} selectedType={selectedWeaponType} onSelectType={setSelectedType} ></WeaponTypeSelector>
                    <SeasonSelector className={classes.weaponTypes} seasons={data?.seasons} selectedSeason={selectedSeason} onSelectSeason={setSelectedSeason} ></SeasonSelector>
                </ScrollContainer>
                <Box p={1} pb={0} display="flex" justifyContent="space-between" alignItems="center" height={30}>
                    <div>Only random rolls</div>
                    <Switch value={onlyRandomRolls} onChange={(_, value) => setOnlyRandomRolls(value)}></Switch>
                </Box>
            </Paper>)
        }, [isMobile, data, selectedWeaponType, selectedSeason])}
        <Box width="100%" display="flex" flexDirection="column">
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>
                    {isMobile ? <Box></Box> : <Typography variant="h6" noWrap>
                        Add Weapon
                    </Typography>}
                    <Box className={classes.search}>
                        <Box className={classes.searchIcon}>
                            <SearchIcon />
                        </Box>
                        <InputBase
                            onChange={(event) => { setTextSearch(event.target.value) }}
                            placeholder="Search…"
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput,
                            }}
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Box>
                    <Box flex={1}></Box>
                    <IconButton component={Link} to={`/wishlist/e/${params.wishlistId}/`}>
                        <CloseIcon></CloseIcon>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box flex={2}>
                {useMemo(() => <CollectibleList wishlistId={wishlistId} collectibles={filteredCollectibles}></CollectibleList>, [filteredCollectibles])}
            </Box>
        </Box>
    </DefaultModal>);
};