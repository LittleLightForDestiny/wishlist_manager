
import React from "react";
import { HashRouter, Route } from 'react-router-dom';
import { SelectWeapon } from "../select_weapon/selectWeapon.view";
import { EditItem } from "./edit";

export const WishlistItemIndex = () => {
    const basePath = "/wishlist/e/:wishlistId/item";
    return (
        <HashRouter>
            <Route exact path={`${basePath}/add`} component={SelectWeapon}></Route>
            <Route exact path={`${basePath}/e/:itemHash`} component={EditItem}></Route>
        </HashRouter>
    );
};

export default WishlistItemIndex;