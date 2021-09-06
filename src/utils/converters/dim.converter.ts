import { WishlistBuild, WishlistTag } from "../../interfaces/wishlist.interface";
import { getInventoryItemList } from "../../services/manifest.service";
import { getBuilds } from "../../services/wishlistBuild.service";
import { getWishlist } from "../../services/wishlists.service";


const exportTags = (tags: WishlistTag[]): string[] => {
    const tagMap: { [tag: string]: string } = {
        [WishlistTag.GodPvE]: 'god-pve',
        [WishlistTag.GodPvP]: 'god-pvp',
        [WishlistTag.PvE]: 'pve',
        [WishlistTag.PvP]: 'pvp',
        [WishlistTag.Curated]: 'curated',
        [WishlistTag.Trash]: 'trash',
        [WishlistTag.Mouse]: 'mnk',
        [WishlistTag.Controller]: 'controller',
    };
    return tags.map((t: string) => {
        let llTag = tagMap[t];
        if (llTag) return llTag;
        return "";
    }).filter((t) => t !== "");
}

const getNameLine = async (build: WishlistBuild): Promise<string> => {

    let list = getInventoryItemList()!;
    let def = list[build.itemHash!];
    let line = `// ${def.displayProperties.name}`;
    let name = build.name;
    if (name) {
        line += ` - ${build.name}`;
    }
    if (build.tags) {
        let tags = exportTags(build.tags).join(',');
        line += ` (${tags})`;
    }
    line += '\n';
    return line;
}

function cartesianProduct<T>(...allEntries: T[][]): T[][] {
    return allEntries
        .filter((e) => e.length > 0)
        .reduce<T[][]>(
            (results, entries) =>
                results
                    .map(result => entries.map(entry => result.concat([entry])))
                    .reduce((subResults, result) => subResults.concat(result), []),
            [[]],
        )
}

const compileBuildLines = async (build: WishlistBuild): Promise<string> => {
    let lines = "";
    lines += await getNameLine(build);
    if (build.description) {
        lines += `//notes: ${build.description}`;
        if (build.tags?.length && lines.indexOf('tags:') < 0) {
            lines += ` tags:${exportTags(build.tags).join(',')}`;
        }
        lines += "\n";
    }

    let permutations = cartesianProduct<number>(...build.plugs!);
    for (var l in permutations) {
        let line = permutations[l];
        lines += `dimwishlist:item=${build.itemHash}&perks=${line.join(',')}\n`;
    }
    return `${lines}\n\n`;
}

export const exportDIM = async (wishlistId: number): Promise<Blob> => {
    let wishlist = await getWishlist(wishlistId);
    let builds = await getBuilds(wishlistId);

    let result: string = "";
    if (wishlist?.name) {
        result += `title:${wishlist.name}\n`;
    }
    if (wishlist?.description) {
        result += `description:${wishlist.description}\n`;
    }
    if (wishlist?.name || wishlist?.description) {
        result += '\n';
    }

    builds = builds.sort((a, b) => {
        let aHash = a.itemHash || 0;
        let bHash = b.itemHash || 0;
        let hashResult = aHash - bHash;
        if (hashResult !== 0) return hashResult;
        let aGodRollCount = a.tags?.filter((t) => [WishlistTag.GodPvE, WishlistTag.GodPvP].indexOf(t) > -1)?.length || 0;
        let bGodRollCount = b.tags?.filter((t) => [WishlistTag.GodPvE, WishlistTag.GodPvP].indexOf(t) > -1)?.length || 0;

        return bGodRollCount - aGodRollCount;
    });

    for (let i = 0; i < builds.length; i++) {
        let build = builds[i];
        result += await compileBuildLines(build);
    };

    var blob = new Blob([result], { type: "text/plain" });
    return blob;
}