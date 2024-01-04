import { faArrowLeft, faDownload, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppBar, Box, Button, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { keyBy as _keyBy, map as _map, countBy } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { Link, RouteChildrenProps } from "react-router-dom";
import ScrollContainer from 'react-scrollbars-custom';
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";
import { WeaponListItem } from "../../components/weapon_list_item/weapon_list_item.component";
import * as events from "../../events";
import Wishlist from "../../interfaces/wishlist.interface";
import { ExtendedCollectible, getFilterableWeapons } from "../../services/weapons.service";
import { getBuilds } from "../../services/wishlistBuild.service";
import { getWishlist } from "../../services/wishlists.service";

interface BuildCount {
    itemHash: number;
    count: number;
}

const CustomScrollbars = ({ children,
    forwardedRef,
    onScroll,
    style,
    className }: any) => {
    return (
        <ScrollContainer
            disableTracksWidthCompensation={true}
            className={className}
            style={style}
            scrollerProps={{
                renderer: props => {
                    const { elementRef, onScroll: rscOnScroll, ...restProps } = props;

                    return (
                        <div
                            {...restProps}
                            onScroll={e => {
                                onScroll(e);
                                if (rscOnScroll && e) {
                                    rscOnScroll(e);
                                }
                            }}
                            ref={ref => {
                                forwardedRef(ref);
                                if (elementRef) {
                                    elementRef(ref);
                                }
                            }}
                        />
                    );
                }
            }}
        >
            {children}
        </ScrollContainer>
    );
};
const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
    <CustomScrollbars {...props} forwardedRef={ref} />
));

const useStyles = {
    root: {
        flexGrow: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
    },
    menuButton: {
        marginRight: 2,
    },
    title: {
        flexGrow: 1,
    },
};

export const EditWishlist = ({ match, history }: RouteChildrenProps) => {
    const { wishlistId } = match?.params as any;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles;
    const [wishlist, setWishlist] = useState<Wishlist>();
    const [definitions, setDefinitions] = useState<{ [hash: number]: ExtendedCollectible }>()
    const [items, setItems] = useState<BuildCount[]>();
    const outerRef = React.createRef();


    function goToMain() {
        history.push("/");
    }

    useEffect(() => {
        async function refreshItems() {
            let builds = await getBuilds(parseInt(wishlistId));
            let items: BuildCount[] = _map(countBy(builds, (b) => b.itemHash), (v, k) => ({ itemHash: parseInt(k), count: v }));
            setItems(items);
            console.log('refresh items');
        }

        async function load() {
            let id = parseInt(wishlistId);
            let w = await getWishlist(id);
            setWishlist(w);
            let c = await getFilterableWeapons()
            let mappedCollectible = _keyBy(c, 'hash')

            setDefinitions(mappedCollectible)
            refreshItems();
        }
        load();

        async function onDbChanges(changes: any) {
            refreshItems();
        }

        const unsubscribe = events.bus.subscribe(events.wishlists.OnWishlistBuildUpdated, onDbChanges);

        return () => {
            unsubscribe();
        };
    }, [wishlistId]);

    return <Box sx={classes.root}>
        <AppBar color="primary" position="static">
            <Toolbar >
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={goToMain}>
                    <FontAwesomeIcon 
                    // sx={classes.menuButton} 
                    icon={faArrowLeft}></FontAwesomeIcon>
                </IconButton>
                <Typography variant="h6" sx={classes.title}>
                    {wishlist?.name}
                </Typography>
                {isMobile ?
                    <IconButton color="inherit" aria-label="menu" component={Link} to={`/wishlist/e/${wishlist?.id}/item/add`}>
                        <FontAwesomeIcon icon={faPlusCircle}></FontAwesomeIcon>
                    </IconButton>
                    :
                    <Button color="primary" variant="contained" component={Link} to={`/wishlist/e/${wishlist?.id}/item/add`}>Add Item</Button>
                }
                <Box p={isMobile ? 0 : 1}></Box>
                {
                    isMobile ?
                        <IconButton color="inherit" aria-label="menu" component={Link} to={`/wishlist/e/${wishlist?.id}/export`}>
                            <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
                        </IconButton>
                        :
                        <Button color="primary" variant="contained" component={Link} to={`/wishlist/e/${wishlist?.id}/export`}>Export Wishlist</Button>
                }
            </Toolbar>
        </AppBar>
        {useMemo(() => <Box flexGrow="1" >
            <AutoSizer style={{ width: "100%", height: "100%" }}>
                {({ height, width }:{height:number, width:number}) => {
                    let totalItems = items?.length || 0;
                    let columnCount = isMobile ? 1 : 3;
                    let rowCount = Math.ceil(totalItems / columnCount);
                    return (
                        <FixedSizeGrid
                            outerElementType={CustomScrollbarsVirtualList}
                            outerRef={outerRef}
                            columnCount={columnCount}
                            columnWidth={width / columnCount}
                            height={height}
                            rowCount={rowCount}
                            rowHeight={80}
                            width={width}
                        >
                            {({ style, rowIndex, columnIndex }) => {
                                let index = rowIndex * columnCount + columnIndex;
                                let item = items ? items[index] : null;
                                if (!item) return <Box style={style}></Box>
                                return <Box style={style}>
                                    <Box padding={1}>
                                        <WeaponListItem definition={definitions[item.itemHash]} itemHash={item.itemHash} wishlistId={wishlistId}></WeaponListItem>
                                    </Box>
                                </Box>
                            }}
                        </FixedSizeGrid>
                    );
                }}
            </AutoSizer>
        </Box>, [items, isMobile, outerRef, definitions, wishlistId])}
    </Box>
};
