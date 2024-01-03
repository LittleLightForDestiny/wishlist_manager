import { Box, useTheme, useMediaQuery } from "@mui/material";
import React from "react";
import RSC from 'react-scrollbars-custom';
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from 'react-window';
import { WeaponListItem } from "../weapon_list_item/weapon_list_item.component";
import { ExtendedCollectible } from "../../services/weapons.service";

export interface CollectibleListProps {
    collectibles: ExtendedCollectible[];
    wishlistId: number;
}

const CustomScrollbars = ({ children,
    forwardedRef,
    onScroll,
    style,
    className }: any) => {
    return (
        <RSC
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
        </RSC>
    );
};

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
    <CustomScrollbars {...props} forwardedRef={ref} />
));

export const CollectibleList = (props: CollectibleListProps) => {
    const outerRef = React.createRef();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    const buildItem = (collectible: ExtendedCollectible) => {
        
        return (
            <Box style={{ padding: "8px" }}>
                <WeaponListItem definition={collectible} itemHash={collectible?.hash} wishlistId={props.wishlistId}></WeaponListItem>
            </Box>);
    };

    return (
        <AutoSizer style={{ width: "100%", height: "100%" }}>
            {({ height, width }) => {
                let totalItems = props.collectibles.length;
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
                            let collectible = props.collectibles[index];
                            if (!collectible) return <Box style={style}></Box>
                            return <Box style={style}>
                                {buildItem(collectible)}
                            </Box>
                        }}
                    </FixedSizeGrid>
                );
            }}
        </AutoSizer>
    );
}