
import { Box, TextField } from "@material-ui/core";
import React, { ChangeEvent } from "react";
import Wishlist from "../../interfaces/wishlist.interface";

export const WishlistMetadataForm = (props: { wishlist?: Wishlist }) => {
    const onChange = (event:ChangeEvent<HTMLInputElement>) => {
        var fieldName = event.target.id;
        var fieldValue = event.target.value;
        let wishlist:any = props.wishlist;
        wishlist[fieldName] = fieldValue;
    };
    return (
        <form noValidate autoComplete="off" style={{ width: "100%" }}>
            <Box pb={1}>
                <TextField id="name" label="Name" variant="outlined" fullWidth onChange={onChange} />
            </Box>
            <Box pb={1}>
                <TextField id="description" label="Description" variant="outlined" fullWidth multiline rows={3} onChange={onChange} />
            </Box>
        </form>);
};
export default WishlistMetadataForm;