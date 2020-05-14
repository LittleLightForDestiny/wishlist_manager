/* eslint-disable */
import { AppBar, Box, createStyles, CssBaseline, fade, IconButton, InputBase, makeStyles, Modal, Paper, Theme, Toolbar, Typography, Switch } from "@material-ui/core";
import { Close as CloseIcon, Search as SearchIcon } from '@material-ui/icons';
import { DestinyCollectibleDefinition, DestinyPresentationNodeDefinition, DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";
import React, { useEffect, useMemo, useState } from "react";
import { Link, RouteChildrenProps } from "react-router-dom";
import ScrollContainer from 'react-scrollbars-custom';
import { AmmoTypeSelector } from "../../components/ammo_type_selector/ammo_type_selector.component";
import { CollectibleList } from "../../components/collectible_list/collectible_list.component";
import { WeaponTypeSelector } from "../../components/weapon_type_selector/weapon_type_selector.component";
import * as dataService from "../../services/data.service";
import useDebounce from "../../hooks/useDebounce.hook";
import { DefaultModal } from "../../components/default_modal/defaultModal.component";


interface ExtendedCollectible extends DestinyCollectibleDefinition {
    ammoNodeHash: number;
    typeNodeHash: number;
}

interface WeaponSearchData {
    nodes: DestinyPresentationNodeDefinition[];
    collectibles: ExtendedCollectible[];
    items: {[ids:string]:(DestinyInventoryItemDefinition & {hasRandomPerks?:false})};
}

async function loadSearchData(): Promise<WeaponSearchData> {
    let nodes = await dataService.loadPresentationNodes();
    let weaponNodes: DestinyPresentationNodeDefinition[] = [];
    let collectibles: ExtendedCollectible[] = [];
    let rootNode = nodes["1528930164"];
    let allCollectibles = await dataService.loadCollectibles();
    let items = await dataService.loadInventoryItemList();
    rootNode.children.presentationNodes.forEach((p) => {
        let ammoNode = nodes[p.presentationNodeHash];
        weaponNodes.push(ammoNode);
        ammoNode.children.presentationNodes.forEach((p) => {
            let typeNode = nodes[p.presentationNodeHash];
            weaponNodes.push(typeNode);
            typeNode.children.collectibles.forEach(c => {
                let collectible = allCollectibles[c.collectibleHash];
                collectibles.push({
                    ...collectible,
                    ammoNodeHash: ammoNode.hash,
                    typeNodeHash: typeNode.hash,
                });
            });
        });
    });
    return {
        nodes: weaponNodes,
        collectibles: collectibles,
        items:items
    }
}

const drawerWidth = 240;
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
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
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
    const [nodes, setNodes] = useState<DestinyPresentationNodeDefinition[]>([]);
    const [enabledNodes, setEnabledNodes] = useState<Set<number>>(new Set());
    const [onlyRandomRolls, setOnlyRandomRolls] = useState<boolean>(false);
    const [textSearch, setTextSearch] = useState<string>("");
    const debouncedSearchTerm = useDebounce(textSearch, 500);
    const [collectibles, setCollectibles] = useState<ExtendedCollectible[]>([]);
    const [data, setData] = useState<WeaponSearchData>();
    const [filteredCollectibles, setFilteredCollectibles] = useState<ExtendedCollectible[]>([]);


    const setPresentationNodeState = (hash: number, on: boolean) => {
        let nodeHashes = new Set(enabledNodes);
        if (on) {
            nodeHashes.add(hash);
        } else {
            nodeHashes.delete(hash);
        }
        setEnabledNodes(nodeHashes);
    }

    const filterCollectibles = ()=>{
        setFilteredCollectibles(collectibles.filter((c) => {
            let nodeMatch = enabledNodes.has(c.ammoNodeHash) && enabledNodes.has(c.typeNodeHash);
            let textMatch = c.displayProperties.name.toLowerCase().indexOf(textSearch) > -1;
            let item = data!.items[c.itemHash];
            let randomMatch = !onlyRandomRolls || item.hasRandomPerks;
            return nodeMatch && textMatch && randomMatch;
        }));
    }

    useEffect(()=>{
        filterCollectibles();
    }, [debouncedSearchTerm, enabledNodes, onlyRandomRolls]);

    useEffect(() => {
        async function load() {
            let data = await loadSearchData();
            setData(data);
            setNodes(data.nodes);
            setEnabledNodes(new Set(data.nodes.map((n) => n.hash)));
            setCollectibles(data.collectibles);
            setFilteredCollectibles(data.collectibles);
        }
        load();
    }, []);

    return (<DefaultModal display="flex" flexDirection="row">
            <CssBaseline />
            {useMemo(()=><Paper square elevation={5} className={classes.drawer}>
                <AmmoTypeSelector presentationNodes={nodes} enabledHashes={enabledNodes} filterToggle={setPresentationNodeState}></AmmoTypeSelector>
                <Box pt={1}></Box>
                <ScrollContainer className={classes.weaponTypeList} disableTracksWidthCompensation={true} >
                    <WeaponTypeSelector className={classes.weaponTypes} presentationNodes={nodes} enabledHashes={enabledNodes} filterToggle={setPresentationNodeState}></WeaponTypeSelector>
                </ScrollContainer>
                <Box p={1} pb={0} display="flex" justifyContent="space-between" alignItems="center" height={30}>
                    <div>Only random rolls</div>
                    <Switch value={onlyRandomRolls} onChange={(_, value)=>setOnlyRandomRolls(value)}></Switch>
                </Box>
            </Paper>, [enabledNodes, onlyRandomRolls])}
            <Box width="100%" display="flex" flexDirection="column">
                <AppBar position="static">
                    <Toolbar className={classes.toolbar}>
                        <Typography variant="h6" noWrap>
                            Add Weapon
                        </Typography>
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