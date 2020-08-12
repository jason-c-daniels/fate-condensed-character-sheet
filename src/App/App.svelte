<script>

    import GlobalCss from "../GlobalCss";
    import CharacterSheet from "../components/CharacterSheet";
    import saveAs from 'file-saver';

    export let name;
    export let appSettings = {applicationName: "WARNING: Please pass appSettings from within main.js props."};
    import Dropzone from "svelte-file-dropzone";

    let showLoadPane = false;

    function getNewCharacter() {
        return {
            name: "",
            fate: 3,
            refresh: 3,
            aspects: {
                highConcept: "",
                trouble: "",
                relationship: "",
                otherAspects: ["", ""]
            },
            skills: [
                {name: "Academics", value: 0},
                {name: "Athletics", value: 0},
                {name: "Burglary", value: 0},
                {name: "Contacts", value: 0},
                {name: "Crafts", value: 0},
                {name: "Deceive", value: 0},
                {name: "Drive", value: 0},
                {name: "Empathy", value: 0},
                {name: "Fight", value: 0},
                {name: "Investigate", value: 0},
                {name: "Lore", value: 0},
                {name: "Notice", value: 0},
                {name: "Physique", value: 0},
                {name: "Provoke", value: 0},
                {name: "Rapport", value: 0},
                {name: "Resources", value: 0},
                {name: "Shoot", value: 0},
                {name: "Stealth", value: 0},
                {name: "Will", value: 0}
            ],
            stunts: [
                {name: "", description: ""},
                {name: "", description: ""},
                {name: "", description: ""},
                {name: "", description: ""},
                {name: "", description: ""},
                {name: "", description: ""}
            ],
            vitals: {
                physicalStressTaken: 0,
                mentalStressTaken: 0,
                consequences: {
                    mild1: "",
                    moderate: "",
                    severe: "",
                    mild2: "",
                }
            }
        };
    }

    let character = getNewCharacter();

    function saveCharacter() {
        var blob = new Blob([JSON.stringify(character, null, 2)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, character.name + ".charfc");
    }

    function loadCharacter() {
        showLoadPane = true;
    }

    function newCharacter() {
        character = getNewCharacter();
    }

    function handleFilesSelect(e) {
        let files = e.detail.acceptedFiles;
        const reader = new FileReader();
        reader.onload = function (e) {
            // e.target.result should contain the text
            let text = e.target.result;
            character = JSON.parse(text);
            showLoadPane = false;
        };
        reader.readAsText(files[0]);

    }

    function printCharacter(e){
        print();
    }

    function cancelLoad() {
        showLoadPane = false;
    }
</script>
<style>
    @import "App.css";
</style>

<svelte:head>
    <title>{appSettings.applicationName}</title>
</svelte:head>

<GlobalCss/>

<div class="action-bar noprint" on:keys.escape={cancelLoad}>
    <input class="noprint" type="button" on:click={newCharacter} value="New"/>
    <input class="noprint" type="button" on:click={loadCharacter} value="Load"/>
    <input class="noprint" type="button" on:click={saveCharacter} value="Save"/>
    <input class="noprint" type="button" on:click={printCharacter} value="Print"/>
    {#if (showLoadPane)}
        <input class="noprint" type="button" on:click={cancelLoad} value="Cancel Load"/>
    {/if}
</div>
<main on:keys.escape={cancelLoad}>
    {#if (showLoadPane)}
        <div class="noprint file-loader" on:keys.escape={cancelLoad}>
            <Dropzone on:drop={handleFilesSelect} on:keys.escape={cancelLoad} containerStyles="height:100%"	/>
        </div>
    {/if}
    <CharacterSheet {character}/>
</main>