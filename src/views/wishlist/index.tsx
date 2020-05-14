
import React from "react";
import { HashRouter, Route } from 'react-router-dom';
import { WishlistItemIndex } from "../item";
import { EditWishlist } from "./edit";
import { LoadWishlist } from "./load";
import { NewWishlist } from "./new";
import { ImportWishlist } from "./import";

export const WishlistsIndex = () => {
    return (
        <HashRouter>
            <Route exact path="/wishlist/new" component={NewWishlist}></Route>
            <Route exact path="/wishlist/load" component={LoadWishlist}></Route>
            <Route exact path="/wishlist/import" component={ImportWishlist}></Route>
            <Route path="/wishlist/e/:wishlistId" component={EditWishlist}></Route>
            <Route path="/wishlist/e/:wishlistId" component={WishlistItemIndex}></Route>
        </HashRouter>
    );
};

export default WishlistsIndex;