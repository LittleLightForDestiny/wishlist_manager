import { WishlistBuild, WishlistTag } from "../../interfaces/wishlist.interface";
import { loadInventoryItemList } from "../../services/data.service";
import { getBuilds } from "../../services/wishlistBuild.service";
import { getWishlist } from "../../services/wishlists.service";


const exportTags = (tags: WishlistTag[]): string[] => {
    const tagMap:{[tag:string]:string}={
        [WishlistTag.GodPvE]: 'god-pve',
        [WishlistTag.GodPvP]: 'god-pvp',
        [WishlistTag.PvE]: 'pve',
        [WishlistTag.PvP]: 'pvp',
        [WishlistTag.Curated]: 'curated',
        [WishlistTag.Trash]: 'trash',
        [WishlistTag.MnK]: 'mnk',
        [WishlistTag.Controller]: 'controller',
    };
    return tags.map((t:string) => {
        let llTag = tagMap[t];
        if(llTag) return llTag;
        return "";
    }).filter((t) => t !== "");
}

const getNameLine = async (build:WishlistBuild):Promise<string>=>{

    let list = await loadInventoryItemList();
    let def = list[build.itemHash!];
    let line = `// ${def.displayProperties.name}`;
    let name = build.name;
    if(name){
        line+=` - ${build.name}`;
    }
    if(build.tags){
        let tags = exportTags(build.tags).join(',');
        line+= ` (${tags})`;
    }
    line+='\n';
    return line;
}

function cartesianProduct<T>(...allEntries: T[][]): T[][] {
    return allEntries
    .filter((e)=>e.length > 0)
    .reduce<T[][]>(
      (results, entries) =>
        results
          .map(result => entries.map(entry => result.concat([entry])))
          .reduce((subResults, result) => subResults.concat(result), []),
      [[]],
    )
  }

const compileBuildLines = async (build:WishlistBuild):Promise<string>=>{
    let lines = "";
    lines+= await getNameLine(build);
    if(build.description){
        lines+=`//notes: ${build.description}`;
        if(build.tags?.length && lines.indexOf('tags:') < 0){
            lines+=` tags:${exportTags(build.tags).join(',')}`;
        }
        lines+="\n";
    }
    
    let permutations = cartesianProduct<number>(...build.plugs!);
    for(var l in permutations){
        let line = permutations[l];
        lines+=`dimwishlist:item=${build.itemHash}&perks=${line.join(',')}\n`;
    }
    return `${lines}\n\n`;
}

export const exportDIM = async (wishlistId:number):Promise<string> => {
    let wishlist = await getWishlist(wishlistId);
    let builds = await getBuilds(wishlistId);

    let result:string = "";
    if(wishlist?.name){
        result+=`title:${wishlist.name}\n`;
    }
    if(wishlist?.description){
        result+=`description:${wishlist.description}\n`;
    }
    if(wishlist?.name || wishlist?.description){
        result+='\n';
    }

    for(var i in builds){
        let build = builds[i];
        result+= await compileBuildLines(build);
    };
    return result;
}