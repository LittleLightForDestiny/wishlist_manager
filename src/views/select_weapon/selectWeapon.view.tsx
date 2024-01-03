import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppBar, Box, CssBaseline, IconButton, InputBase, Paper, Switch, Theme, Toolbar, Typography, alpha, useMediaQuery, useTheme } from "@mui/material";
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
    let orderedTypes:string[] = [];
    let seasons = new Set<number>();
    collectibles.forEach((c) => {
        if (c.itemTypeDisplayName) {
            types.add(c.itemTypeDisplayName);
            if(!orderedTypes.includes(c.itemTypeDisplayName)){
                orderedTypes.push(c.itemTypeDisplayName);
            }
        }
        if (c.season) {
            seasons.add(c.season);
        }

    });
    collectibles.sort((a, b) => {
        let diff = b.season - a.season;
        if (diff !== 0) return diff;
        diff = b.inventory?.tierType - a.inventory?.tierType
        if (diff !== 0) return diff;
        diff = orderedTypes.indexOf(a.itemTypeDisplayName) - orderedTypes.indexOf(b.itemTypeDisplayName)
        if (diff !== 0) return diff;
        return a.displayProperties.name > b.displayProperties.name ? 1 : -1;
    });
    console.log(collectibles.map((c)=>c.itemTypeDisplayName))
    return {
        collectibles,
        types,
        seasons
    }
}

const drawerWidth = 340;
const useStyles = {
        drawer: {
            position: "relative",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            width: drawerWidth,
            flexShrink: 0,
            height: "100%",
            padding: 1,
            background: 'primary.dark',
        },
        search: {
            position: 'relative',
            borderRadius: (theme:Theme) => theme.shape.borderRadius,
            backgroundColor: (theme:Theme) => alpha(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: (theme:Theme) => alpha(theme.palette.common.white, 0.25),
            },
            marginRight: 2,
            marginLeft: {
                sx: 0,
                sm: 3,
            },
            width: {
                xs:'100%',
                sm:'auto'
            }
        },
        searchIcon: {
            padding: (theme:Theme)=>theme.spacing(0, 2),
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
            padding: (theme:Theme) => theme.spacing(1, 1, 1, 0),
            paddingLeft: (theme:Theme) => `calc(1em + ${theme.spacing(4)}px)`,
            transition: (theme:Theme) => theme.transitions.create('width'),
            width: {
                xs: '100%',
                md: '20ch'
            }
        },
        weaponTypeList: {
            flexGrow: 1,
        },
        weaponTypes: {
            width: "100%"
        },
        content: {
            flexGrow: 1,
            backgroundColor: 'background.default',
            padding: 3,
        },
        toolbar: {
            paddingRight: 1,
        }
    };

export const SelectWeapon = ({ match }: RouteChildrenProps) => {
    const params = match!.params as any;
    const wishlistId = params.wishlistId;
    const classes = useStyles;
    const [selectedWeaponType, setSelectedType] = useState<string>();
    const [selectedSeason, setSelectedSeason] = useState<number>(-1);
    const [onlyRandomRolls, setOnlyRandomRolls] = useState<boolean>(false);
    const [textSearch, setTextSearch] = useState<string>("");
    const debouncedSearchTerm = useDebounce(textSearch, 500);
    const [data, setData] = useState<WeaponSearchData>();
    const [filteredCollectibles, setFilteredCollectibles] = useState<ExtendedCollectible[]>([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));


    

    useEffect(() => {
        const filterCollectibles = () => {
            setFilteredCollectibles(data?.collectibles?.filter((c) => {
                let textMatch = c.displayProperties.name.toLowerCase().indexOf(textSearch.toLowerCase()) > -1;
                let typeMatch = !selectedWeaponType || c?.itemTypeDisplayName.toLowerCase() === selectedWeaponType.toLowerCase();
                let seasonMatch = selectedSeason < 0 || c.season === selectedSeason;
                return textMatch && typeMatch && seasonMatch;
            }) ?? []);
        }
        filterCollectibles();
    }, [debouncedSearchTerm, selectedWeaponType, onlyRandomRolls, selectedSeason, data, textSearch]);

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
            return isMobile ? <Box></Box> : (<Paper square elevation={5} sx={{
                    position: "relative",
                    zIndex: 1200,
                    display: "flex",
                    flexDirection: "column",
                    width: drawerWidth,
                    flexShrink: 0,
                    height: "100%",
                    padding: theme.spacing(1),
                    background: 'primary.dark',
            }}>
                <Box pt={1}></Box>
                <ScrollContainer disableTracksWidthCompensation={true} >
                    <WeaponTypeSelector sx={classes.weaponTypes} weaponTypes={data?.types} selectedType={selectedWeaponType} onSelectType={setSelectedType} ></WeaponTypeSelector>
                    <SeasonSelector sx={classes.weaponTypes} seasons={data?.seasons} selectedSeason={selectedSeason} onSelectSeason={setSelectedSeason} ></SeasonSelector>
                </ScrollContainer>
                <Box p={1} pb={0} display="flex" justifyContent="space-between" alignItems="center" height={30}>
                    <div>Only random rolls</div>
                    <Switch value={onlyRandomRolls} onChange={(_, value) => setOnlyRandomRolls(value)}></Switch>
                </Box>
            </Paper>)
        }, [isMobile, theme, classes.weaponTypes, data, selectedWeaponType, selectedSeason, onlyRandomRolls])}
        <Box width="100%" display="flex" flexDirection="column">
            <AppBar position="static">
                <Toolbar sx={classes.toolbar}>
                    {isMobile ? <Box></Box> : <Typography variant="h6" noWrap>
                        Add Weapon
                    </Typography>}
                    <Box sx={classes.search}>
                        <Box sx={classes.searchIcon}>
                            <FontAwesomeIcon icon={faSearch} />
                            
                        </Box>
                        <InputBase
                            onChange={(event) => { setTextSearch(event.target.value) }}
                            placeholder="Search…"
                            // classes={{
                            //     root: classes.inputRoot,
                            //     input: classes.inputInput,
                            // }}
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Box>
                    <Box flex={1}></Box>
                    <IconButton component={Link} to={`/wishlist/e/${params.wishlistId}/`}>
                        <FontAwesomeIcon icon={faTimes} />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box flex={2}>
                {useMemo(() => <CollectibleList wishlistId={wishlistId} collectibles={filteredCollectibles}></CollectibleList>, [filteredCollectibles, wishlistId])}
            </Box>
        </Box>
    </DefaultModal>);
};