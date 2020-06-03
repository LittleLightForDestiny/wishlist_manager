
import { Box, Button, Card, Checkbox, createStyles, Divider, FormControlLabel, Grid, makeStyles, TextField, Theme, useMediaQuery, useTheme } from "@material-ui/core";
import { DestinyInventoryItemDefinition, DestinyItemSocketCategoryDefinition } from "bungie-api-ts/destiny2/interfaces";
import React, { ChangeEvent, useEffect, useState } from "react";
import ScrollContainer from "react-scrollbars-custom";
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import { InventoryItemImage } from "../../components/inventory_item_image/inventory_item_image.component";
import { ModTooltipContent } from "../../components/mod_tooltip_content/mod_tooltip_content.component";
import { SectionHeader } from "../../components/section_header/section_header.component";
import { WishlistBuild, WishlistTag } from "../../interfaces/wishlist.interface";
import { loadPlugSetDefinition } from "../../services/data.service";
import { saveBuild } from "../../services/wishlistBuild.service";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        perks: {
            display: "flex",
            flexDirection: "row",
        },
        perkColumn: {
            display: "flex",
            flexDirection: "column",
            width: 48,
        },
        tagCheckBox:{
            width:"50%",
            marginRight:0,
        },
        perk: {
            width: 48,
            height: 48
        },
    }),
);

function createBlankBuild(wishlistId:number, itemHash:number):WishlistBuild{
    return {
        wishlistId:wishlistId,
        itemHash:itemHash,
        tags:[],
        name:"",
        description:""
    };
}

const ScrollableWhen = ({ children, condition }: any) => {
    if (condition) {
        return <ScrollContainer disableTracksWidthCompensation={true} noScrollX>
            {children}
        </ScrollContainer>;
    }
    return children;
};

export const WishlistBuildForm = (props: { wishlistId: number, build?: WishlistBuild, def: DestinyInventoryItemDefinition }) => {
    const classes = useStyles();
    const blankBuild:WishlistBuild = createBlankBuild(props.wishlistId, props.def.hash);

    const [curatedPerks, setCuratedPerks] = useState<number[][]>([]);
    const [randomPerks, setRandomPerks] = useState<number[][]>([]);
    const [selectedPerks, setSelectedPerks] = useState<number[][]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    let initialBuild = props.build ? {...props.build} : {...blankBuild};
    const [build, setBuild] = useState<WishlistBuild>(initialBuild);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        var fieldName = event.target.id;
        var fieldValue = event.target.value;
        setBuild({
            ...build,
            [fieldName]: fieldValue
        })
    };
    async function save() {
        await saveBuild({
            ...build,
            plugs: selectedPerks,
        });
        if (!build.id) {
            setBuild({
                ...blankBuild
            });
            setSelectedPerks(randomPerks.map((p) => []));
        }
    }

    function removePerk(hash: number, index: number) {
        selectedPerks[index] = selectedPerks[index].filter((p) => p !== hash);
        setSelectedPerks([...selectedPerks]);
    }

    function addPerk(hash: number, index: number) {
        selectedPerks[index].push(hash);
        setSelectedPerks([...selectedPerks]);
    }

    useEffect(() => {
        async function populatePlugArrays(cat: DestinyItemSocketCategoryDefinition, curatedArray?: number[][], randomizedArray?: number[][]) {
            for (var i in cat.socketIndexes) {
                let index = cat.socketIndexes[i];
                let entry = props.def.sockets.socketEntries[index];
                let randomPlugSet = entry.randomizedPlugSetHash ? (await loadPlugSetDefinition(entry.randomizedPlugSetHash)) : null;
                let reusablePlugSet = entry.reusablePlugSetHash && entry.reusablePlugSetHash !== 1074 ? (await loadPlugSetDefinition(entry.reusablePlugSetHash)) : null;
                let curated: number[] = [];
                let random: number[] = [];
                if (entry.singleInitialItemHash && entry.singleInitialItemHash !== 2285418970) {
                    curated.push(entry.singleInitialItemHash);
                }

                if (reusablePlugSet) {
                    let skip = reusablePlugSet.reusablePlugItems.some((p) => p.plugItemHash === 2285418970);
                    if (!skip) {
                        reusablePlugSet.reusablePlugItems.forEach((p) => {
                            if (curated.indexOf(p.plugItemHash) === -1) {
                                curated.push(p.plugItemHash);
                            }
                        });
                    }
                }
                if (randomPlugSet) {
                    randomPlugSet.reusablePlugItems.forEach((p) => {
                        if (curated.indexOf(p.plugItemHash) === -1 && random.indexOf(p.plugItemHash) === -1) {
                            random.push(p.plugItemHash);
                        }
                    });
                }

                curatedArray?.push(curated);
                randomizedArray?.push(random);
            }
        }

        function getCategories(): { perkCat?: DestinyItemSocketCategoryDefinition, modCat?: DestinyItemSocketCategoryDefinition } {
            let result: { perkCat?: DestinyItemSocketCategoryDefinition, modCat?: DestinyItemSocketCategoryDefinition } = {};
            props.def.sockets?.socketCategories?.forEach((cat) => {
                if (cat.socketCategoryHash === 4241085061) {
                    result.perkCat = cat;
                }
                if (cat.socketCategoryHash === 2685412949) {
                    result.modCat = cat;
                }
            });
            return result;
        }
        async function load() {
            let cats = getCategories();
            let curatedPerks: number[][] = [];
            let randomPerks: number[][] = [];
            if (cats.perkCat) {
                await populatePlugArrays(cats.perkCat, curatedPerks, randomPerks);
            }
            setCuratedPerks(curatedPerks);
            setRandomPerks(randomPerks);

            let buildPlugs:number[][]|null = props.build?.plugs ? [...props.build.plugs] : null;
            setSelectedPerks(randomPerks.map((random, index) => {
                if(!buildPlugs) return [];
                let curated = curatedPerks[index];
                if(buildPlugs[index]){
                    let containsPlugs = buildPlugs[index].some((p)=>{
                        return random.indexOf(p) > -1 || curated.indexOf(p) > -1;
                    });
                    if(containsPlugs){
                        let result = buildPlugs[index];
                        buildPlugs[index] = [];
                        return result;
                    }
                }
                let sortedPlugs = [...buildPlugs].sort((a, b)=>{
                    let countA = a.filter((p)=>random.indexOf(p) > -1 || curated.indexOf(p) > -1 ).length;
                    let countB = b.filter((p)=>random.indexOf(p) > -1 || curated.indexOf(p) > -1).length;
                    return countB - countA;
                });

                if(sortedPlugs[0] && sortedPlugs[0].length > 0){
                    let originalIndex = buildPlugs.indexOf(sortedPlugs[0]);
                    buildPlugs[originalIndex] = [];
                    return sortedPlugs[0];
                }
                return [];
            }));
            setLoaded(true);
        }
        if(props.build){
            let blank = createBlankBuild(props.wishlistId, props.def.hash);
            let build = {...blank, ...props.build};
            if(!build.name) build.name = "";
            if(!build.description) build.description = "";
            setBuild({...build});
        }else{
            let blank = createBlankBuild(props.wishlistId, props.def.hash);
            setBuild({...blank});
        }
        load();
    }, [props.def.sockets, props.build, props.wishlistId, props.def.hash]);


    if (!loaded) {
        return <Box></Box>;
    }

    function containsTag(tag: WishlistTag): boolean {
        if (!build.tags) return false;
        return build.tags?.indexOf(tag) > -1;
    }

    function handleTagChange(tag: WishlistTag, value: any) {
        if (value && !containsTag(tag)) {
            build.tags?.push(tag);
        }
        if (!value && containsTag(tag)) {
            build.tags = build.tags?.filter((t) => t !== tag);
        }
        setBuild({
            ...build
        });
    }

    function buildPerkIcon(p:number, onClick:()=>void) {
        return <Tooltip key={p} trigger="mouseenter" html={<ModTooltipContent hash={p}></ModTooltipContent>} >
            <Box onClick={(_)=>onClick()}>
                <InventoryItemImage className={classes.perk} hash={p}></InventoryItemImage>
            </Box>
        </Tooltip>;
    }

    return (
        <Card style={{ height: "100%" }}>
            <Box display="flex" flexDirection="column" p={1} height="100%">
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={8}>
                        <form noValidate autoComplete="off" style={{ width: "100%" }}>
                            <Box pb={1}>
                                <TextField id="name" label="Name" variant="outlined" fullWidth onChange={onChange} value={build.name} />
                            </Box>
                            <Box pb={1}>
                                <TextField id="description" label="Description" variant="outlined" fullWidth multiline rows={4} value={build.description} onChange={onChange} />
                            </Box>
                        </form>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <SectionHeader>Tag</SectionHeader>
                        <Card variant="outlined">
                            <Box p={1} py={0} display="flex" flexWrap="wrap">
                                <FormControlLabel
                                    className={classes.tagCheckBox}
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.GodPvE)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.GodPvE, value)}
                                        name="GodPvE" />}
                                    label="GodPvE"
                                />
                                <FormControlLabel
                                    className={classes.tagCheckBox}
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.PvE)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.PvE, value)}
                                        name="PvE" />}
                                    label="PvE"
                                />
                                <FormControlLabel
                                    className={classes.tagCheckBox}
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.GodPvP)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.GodPvP, value)}
                                        name="GodPvP" />}
                                    label="GodPvP"
                                />
                                <FormControlLabel
                                    className={classes.tagCheckBox}
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.PvP)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.PvP, value)}
                                        name="PvP" />}
                                    label="PvP"
                                />
                                <FormControlLabel
                                    className={classes.tagCheckBox}
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.MnK)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.MnK, value)}
                                        name="MnK" />}
                                    label="Mouse"
                                />
                                <FormControlLabel
                                    className={classes.tagCheckBox}
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.Controller)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.Controller, value)}
                                        name="Controller" />}
                                    label="Controller"
                                />
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
                <Box flex={1} flexGrow={1} mt={1}>
                    <ScrollableWhen condition={!isMobile}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <SectionHeader>
                                    Selected Perks
                                </SectionHeader>
                                <Box className={classes.perks}>
                                    {selectedPerks.map((perks, index) =>
                                        <Box key={index} className={classes.perkColumn}>
                                            {perks.map((p) =>
                                                 buildPerkIcon(p, ()=>removePerk(p, index)))}
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box mr={1}>
                                    <SectionHeader>
                                        Curated Perks
                                    </SectionHeader>
                                    <Box className={classes.perks}>
                                        {curatedPerks.map((perks, index) =>
                                            <Box key={index} className={classes.perkColumn}>
                                                {perks.filter((p) => selectedPerks[index].indexOf(p) === -1).map((p) =>
                                                        buildPerkIcon(p, ()=>addPerk(p, index)))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                                {randomPerks.some((p) => p.length > 0) ? (
                                    <Box mr={1}>
                                        <SectionHeader>
                                            Random Perks
                                    </SectionHeader>
                                        <Box className={classes.perks}>
                                            {randomPerks.map((perks, index) =>
                                                <Box key={index} className={classes.perkColumn}>
                                                    {perks.filter((p) => selectedPerks[index].indexOf(p) === -1).map((p) =>
                                                        buildPerkIcon(p, ()=>addPerk(p, index)))}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>) : <Box></Box>}
                            </Grid>
                        </Grid>
                    </ScrollableWhen>
                </Box>
                <Box m={1} my={0}>
                    <Divider></Divider>
                </Box>
                <Box m={1} mt={1} display="flex" justifyContent="flex-end">
                    <Button variant="contained" color="primary" onClick={save}>
                        Save Build
                    </Button>
                </Box>
            </Box>
        </Card>);
};
export default WishlistBuildForm;