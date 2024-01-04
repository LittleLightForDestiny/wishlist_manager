import { Box } from "@mui/material";
import React from "react";
import RSC from 'react-scrollbars-custom';
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from 'react-window';
import { ExtendedCollectible } from "../../services/weapons.service";
import { WeaponListItem } from "../weapon_list_item/weapon_list_item.component";

export interface CollectibleListProps {
    collectibles: ExtendedCollectible[];
    wishlistId: number;
    columnCount: number;
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
    const columnCount = props.columnCount;

    const buildItem = (collectible: ExtendedCollectible) => {

        return (
            <Box style={{ padding: "8px" }}>
                <WeaponListItem definition={collectible} itemHash={collectible?.hash} wishlistId={props.wishlistId}></WeaponListItem>
            </Box>);
    };

    return (
        <AutoSizer style={{ width: "100%", height: "100%" }}>
            {({ height, width }: { height: number, width: number }) => {
                let totalItems = props.collectibles.length;
                let rowCount = Math.ceil(totalItems / columnCount);
                const columnWidth = width / columnCount
                return (
                    <Box key={`column_width_${columnWidth}`}>
                        <FixedSizeGrid
                            outerElementType={CustomScrollbarsVirtualList}
                            outerRef={outerRef}
                            columnCount={columnCount}
                            columnWidth={columnWidth}
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
                    </Box>
                );
            }}
        </AutoSizer>
    );
}