import { createEventDefinition } from "ts-bus";

export const OnWishlistBuildUpdated = createEventDefinition<void>()("WISHLIST_BUILD_UPDATED");