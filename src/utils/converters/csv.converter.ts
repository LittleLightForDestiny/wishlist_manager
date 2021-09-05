import { compact, groupBy } from "lodash";
import { WishlistBuild, WishlistTag } from "../../interfaces/wishlist.interface";
import { getInventoryItemDefinition, getInventoryItemList } from "../../services/manifest.service";
import { getBuilds } from "../../services/wishlistBuild.service";
import { getWishlist } from "../../services/wishlists.service";


const convertTags = (tags: WishlistTag[]): string => {
    const tagMap: { [tag: string]: string } = {
        [WishlistTag.PvE]: 'PvE',
        [WishlistTag.PvP]: 'PvP',
    };
    return tags.map((t: string) => {
        let llTag = tagMap[t];
        if (llTag) return llTag;
        return "";
    }).filter((t) => t !== "").join(',');
}

interface CSVBuild {
    sights: string;
    magazine: string;
    perk1: string;
    perk2: string;
    activity: string;
}

interface CSVItem {
    hash: string;
    bucketHash: number;
    name: string;
    type: string;
    archetype: string;
    element: string;
    builds: CSVBuild[];
}

async function convertPerks(hashes: number[], godHashes: number[]): Promise<string> {
    if (!hashes) return "";
    let defs = getInventoryItemList()!;
    let perkNames: string[] = [];
    for (let h in hashes) {
        let hash = hashes[h];
        let def = defs[hash];
        // if(godHashes.indexOf(hash) > -1){
        //     perkNames.push(`*${def.displayProperties.name}*`);
        // }else{
        perkNames.push(def.displayProperties.name);
        // }

    }
    return perkNames.join(',');
}

async function convertBuild(godBuild: WishlistBuild, mainBuild: WishlistBuild): Promise<CSVBuild | null> {
    if (!mainBuild && !godBuild) return null;
    return {
        sights: await convertPerks(mainBuild.plugs![0], godBuild.plugs![0]),
        magazine: await convertPerks(mainBuild.plugs![1], godBuild.plugs![1]),
        perk1: await convertPerks(mainBuild.plugs![2], godBuild.plugs![2]),
        perk2: await convertPerks(mainBuild.plugs![3], godBuild.plugs![3]),
        activity: convertTags(mainBuild.tags!)
    };
}

async function convertItem(hash: string, builds: WishlistBuild[]): Promise<CSVItem> {
    let def = getInventoryItemDefinition(parseInt(hash))!;
    let pveBuild = builds.filter((b) => (b.tags?.indexOf(WishlistTag.PvE) ?? -1) > -1)[0];
    let godPveBuild = builds.filter((b) => (b.tags?.indexOf(WishlistTag.GodPvE) ?? -1) > -1)[0];
    let pvpBuild = builds.filter((b) => (b.tags?.indexOf(WishlistTag.PvP) ?? -1) > -1)[0];
    let godPvpBuild = builds.filter((b) => (b.tags?.indexOf(WishlistTag.GodPvP) ?? -1) > -1)[0];
    let damageTypes: { [id: number]: string } = {
        1: "Kinetic",
        2: "Arc",
        3: "Solar",
        4: "Void"
    };
    let category = def.sockets.socketCategories.filter((c) => c.socketCategoryHash === 3956125808)[0];
    let intrinsicPerk = def.sockets.socketEntries[category.socketIndexes[0]];
    let defs = getInventoryItemList()!;
    let intrinsicPerkDef = defs[intrinsicPerk.singleInitialItemHash];
    return {
        hash: hash,
        bucketHash: def.inventory.bucketTypeHash,
        name: def.displayProperties.name,
        type: def.itemTypeDisplayName,
        archetype: intrinsicPerkDef.displayProperties.name,
        element: damageTypes[def.defaultDamageType],
        builds: compact([
            await convertBuild(godPveBuild, pveBuild),
            await convertBuild(godPvpBuild, pvpBuild)
        ])
    };
}

export const exportCSV = async (wishlistId: number): Promise<Blob> => {
    await getWishlist(wishlistId);
    let builds = await getBuilds(wishlistId);

    let result: string = "";

    const header = "Name,Type,Archetype,Element,Sights/Barrels,Magazine,Perk 1,Perk 2,Masterwork,Activity";
    result += header + "\n";
    const grouped = groupBy(builds, (b) => b.itemHash);
    let csvItems: CSVItem[] = [];
    for (let hash in grouped) {
        var csvItem = await convertItem(hash, grouped[hash]);
        csvItems.push(csvItem);
    }
    let buckets = [1498876634, 2465295065, 953998645];
    csvItems = csvItems.sort((a, b) => {
        let bucketIndexA = buckets.indexOf(a.bucketHash);
        let bucketIndexB = buckets.indexOf(b.bucketHash);
        let bucketDiff = bucketIndexA - bucketIndexB;
        if (bucketDiff !== 0) return bucketDiff;
        if (a.type > b.type) return 1;
        if (a.type < b.type) return -1;
        return 0;
    });

    for (let i in csvItems) {
        let item = csvItems[i];
        for (let b = 0; b < item.builds.length; b++) {
            let build = item.builds[b];
            if (b === 0) {
                result += `"${item.name}",${item.type},"${item.archetype}",${item.element},"${build.sights}","${build.magazine}","${build.perk1}","${build.perk2}", ,"${build.activity}"\n`;
            } else {
                result += `,,,,"${build.sights}","${build.magazine}","${build.perk1}","${build.perk2}", ,"${build.activity}"\n`;
            }
        }
        result += `,,,,,,,,\n`;
    }

    console.log(result);
    var blob = new Blob([result], { type: "text/csv" });
    return blob;
}