
import { Box, TextField } from "@material-ui/core";
import React, { ChangeEvent, useState } from "react";
import Wishlist from "../../interfaces/wishlist.interface";

export const WishlistMetadataForm = (props: { wishlist?: Wishlist, onChange:(wishlist:Wishlist)=>void }) => {
    const [wishlist, setWishlist] = useState<Wishlist>({ 
        ...props.wishlist,
        name:props?.wishlist?.name || "",
        description:props?.wishlist?.description || ""
     });
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        var fieldName = event.target.id;
        var fieldValue = event.target.value;
        let w = {
            ...wishlist,
            [fieldName]: fieldValue
        };
        setWishlist(w);
        props.onChange(w);
    };
    return (
        <form noValidate autoComplete="off" style={{ width: "100%" }}>
            <Box pb={1}>
                <TextField id="name" label="Name" variant="outlined" value={wishlist?.name} fullWidth onChange={onChange} />
            </Box>
            <Box pb={1}>
                <TextField id="description" label="Description" variant="outlined" value={wishlist?.description} fullWidth multiline rows={3} onChange={onChange} />
            </Box>
        </form>);
};
export default WishlistMetadataForm;