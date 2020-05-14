
import { Box, Button, Card, Checkbox, createStyles, Divider, FormControlLabel, Grid, makeStyles, TextField, Theme } from "@material-ui/core";
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
        perk: {
            width: 48,
            height: 48
        },
    }),
);

export const WishlistBuildForm = (props: { wishlistId: number, build?: WishlistBuild, def: DestinyInventoryItemDefinition }) => {
    const classes = useStyles();
    const blankBuild:WishlistBuild = {
        wishlistId:props.wishlistId,
        itemHash:props.def.hash,
        tags:[],
        name:"",
        description:""
    };

    const [curatedPerks, setCuratedPerks] = useState<number[][]>([]);
    const [randomPerks, setRandomPerks] = useState<number[][]>([]);
    const [selectedPerks, setSelectedPerks] = useState<number[][]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);

    const [build, setBuild] = useState<WishlistBuild>(props.build || {
        ...blankBuild
    });

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

            setSelectedPerks(randomPerks.map((p, index) => {
                if(props.build?.plugs && props.build.plugs[index]){
                    return props.build.plugs[index];
                }
                return [];
            }));
            setLoaded(true);
        }
        if(props.build){
            setBuild({...props.build});
        }else{
            setBuild({...blankBuild});
        }
        load();
    }, [props.def.sockets, props.build]);


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
                    <Grid item md={9}>
                        <form noValidate autoComplete="off" style={{ width: "100%" }}>
                            <Box pb={1}>
                                <TextField id="name" label="Name" variant="outlined" fullWidth onChange={onChange} value={build.name} />
                            </Box>
                            <Box pb={1}>
                                <TextField id="description" label="Description" variant="outlined" fullWidth multiline rows={3} value={build.description} onChange={onChange} />
                            </Box>
                        </form>
                    </Grid>
                    <Grid item md={3}>
                        <SectionHeader>Tag</SectionHeader>
                        <Card variant="outlined">
                            <Box p={1} py={0}>
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.GodPvE)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.GodPvE, value)}
                                        name="GodPvE" />}
                                    label="GodPvE"
                                />
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.PvE)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.PvE, value)}
                                        name="PvE" />}
                                    label="PvE"
                                />
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.GodPvP)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.GodPvP, value)}
                                        name="GodPvP" />}
                                    label="GodPvP"
                                />
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={containsTag(WishlistTag.PvP)}
                                        onChange={(_, value) => handleTagChange(WishlistTag.PvP, value)}
                                        name="PvP" />}
                                    label="PvP"
                                />
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
                <Box flex={1} flexGrow={1}>
                    <ScrollContainer noScrollX>
                        <Grid container spacing={1}>
                            <Grid item md={6}>
                                <SectionHeader>
                                    Selected Perks
                                </SectionHeader>
                                <Box className={classes.perks}>
                                    {selectedPerks.map((perks, index) =>
                                        <Box key={index} className={classes.perkColumn}>
                                            {perks.map((p) =>
                                                <Box key={p} onClick={(ev) => removePerk(p, index)}>
                                                    <InventoryItemImage className={classes.perk} hash={p}></InventoryItemImage>
                                                </Box>)}
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item md={6}>
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
                    </ScrollContainer>
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