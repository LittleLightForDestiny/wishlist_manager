import { faBars, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppBar, Box, CssBaseline, Drawer, IconButton, InputBase, Toolbar, Typography, alpha, colors, styled, useMediaQuery, useTheme } from "@mui/material";
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

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

const WeaponSearchModal = styled(DefaultModal)(({ theme }) => ({
    width: '100vw',
    height: '100vh',
    [theme.breakpoints.up('sm')]: {
        width: 'calc(100vw - 80px)',
        height: 'calc(100vh - 80px)',
    },
}))

const SideMenu = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        position: 'absolute',
    },
    position: "relative",
    padding: theme.spacing(1),
    background: colors.blueGrey[700],
}))


async function loadSearchData(): Promise<WeaponSearchData> {
    let collectibles = await getFilterableWeapons();
    let types = new Set<string>();
    let orderedTypes: string[] = [];
    let seasons = new Set<number>();
    collectibles.forEach((c) => {
        if (c.itemTypeDisplayName) {
            types.add(c.itemTypeDisplayName);
            if (!orderedTypes.includes(c.itemTypeDisplayName)) {
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
    console.log(collectibles.map((c) => c.itemTypeDisplayName))
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
    weaponTypeList: {
        flexGrow: 1,
    },
    weaponTypes: {
        width: "100%"
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
    const [textSearch, setTextSearch] = useState<string>("");
    const debouncedSearchTerm = useDebounce(textSearch, 500);
    const [data, setData] = useState<WeaponSearchData>();
    const [filteredCollectibles, setFilteredCollectibles] = useState<ExtendedCollectible[]>([]);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
    const theme = useTheme();
    const fixedDrawer = useMediaQuery(theme.breakpoints.up('sm'))
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'))
    const isMedium = useMediaQuery(theme.breakpoints.up('md'))
    const columnCount = isLarge ? 3 : isMedium ? 2 : 1

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
    }, [debouncedSearchTerm, selectedWeaponType, selectedSeason, data, textSearch]);

    useEffect(() => {
        async function load() {
            let data = await loadSearchData();
            setData(data);
            setFilteredCollectibles(data.collectibles);
        }
        load();
    }, []);
    return (<WeaponSearchModal display="flex" flexDirection="row">
        <CssBaseline />
            <SideMenu
                variant={fixedDrawer ? 'permanent' : 'temporary'}
                open = {fixedDrawer || drawerOpen}
                anchor="left">
                    {useMemo(() => 
                <ScrollContainer disableTracksWidthCompensation={true} >
                    <WeaponTypeSelector sx={classes.weaponTypes} weaponTypes={data?.types} selectedType={selectedWeaponType} onSelectType={setSelectedType} ></WeaponTypeSelector>
                    <SeasonSelector sx={classes.weaponTypes} seasons={data?.seasons} selectedSeason={selectedSeason} onSelectSeason={setSelectedSeason} ></SeasonSelector>
                </ScrollContainer>
                , [classes.weaponTypes, data, selectedWeaponType, selectedSeason])}
            </SideMenu>
        <Box width="100%" display="flex" flexDirection="column">
            <AppBar position="static">
                <Toolbar sx={classes.toolbar}>
                    {fixedDrawer ? <Typography variant="h6" noWrap>
                        Add Weapon
                    </Typography> :
                        <IconButton onClick={()=>setDrawerOpen(!drawerOpen)}>
                            <FontAwesomeIcon icon={faBars} />
                        </IconButton>}
                    <Search>
                        <SearchIconWrapper>
                            <FontAwesomeIcon icon={faSearch} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            onChange={(event) => { setTextSearch(event.target.value) }}
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                    <Box flex={1}></Box>
                    <IconButton component={Link} to={`/wishlist/e/${params.wishlistId}/`}>
                        <FontAwesomeIcon icon={faTimes} />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box flex={2} sx={{
                backgroundColor: colors.blueGrey[900]
            }}>
                {useMemo(() => <CollectibleList wishlistId={wishlistId} collectibles={filteredCollectibles}
                    columnCount={columnCount}
                ></CollectibleList>, [filteredCollectibles, wishlistId, columnCount])}
            </Box>
        </Box>
    </WeaponSearchModal>);
};