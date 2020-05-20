import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppBar, Box, Button, createStyles, IconButton, makeStyles, Theme, Toolbar, Typography } from "@material-ui/core";
import { countBy, map as _map } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { Link, RouteChildrenProps } from "react-router-dom";
import ScrollContainer from 'react-scrollbars-custom';
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";
import { WeaponListItem } from "../../components/weapon_list_item/weapon_list_item.component";
import Wishlist from "../../interfaces/wishlist.interface";
import db from "../../services/database.service";
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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            minHeight:"100vh",
            display:"flex",
            flexDirection:"column"
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
    }),
);

export const EditWishlist = ({ match, history }: RouteChildrenProps) => {
    const { wishlistId } = match?.params as any;
    const classes = useStyles();
    const [wishlist, setWishlist] = useState<Wishlist>();
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
        }

        async function load() {
            let id = parseInt(wishlistId);
            let w = await getWishlist(id);
            setWishlist(w);
            refreshItems();
        }
        load();

        async function onDbChanges(changes: any) {
            refreshItems();
        }

        db.on('changes', onDbChanges);

        return () => {
            db.on('changes').unsubscribe(onDbChanges);
        };
    }, [wishlistId]);

    return <Box className={classes.root}>
        <AppBar color="primary" position="static">
            <Toolbar >
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={goToMain}>
                    <FontAwesomeIcon className={classes.menuButton} icon={faArrowLeft}></FontAwesomeIcon>
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                    {wishlist?.name}
                </Typography>
                <Button color="default" variant="contained" component={Link} to={`/wishlist/e/${wishlist?.id}/item/add`}>Add Item</Button>
                <Box p={1}></Box>
                <Button color="default" variant="contained" component={Link} to={`/wishlist/e/${wishlist?.id}/export`}>Export Wishlist</Button>
            </Toolbar>
        </AppBar>
        {useMemo(()=><Box flexGrow="1" >
            <AutoSizer style={{ width: "100%", height: "100%" }}>
                {({ height, width }) => {
                    let totalItems = items?.length || 0;
                    let columnCount = 3;
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
                                        <WeaponListItem itemHash={item.itemHash} wishlistId={wishlistId}></WeaponListItem>
                                    </Box>
                                </Box>
                            }}
                        </FixedSizeGrid>
                    );
                }}
            </AutoSizer>
        </Box>, [items, outerRef, wishlistId])}
    </Box>
};