<script>

    import GlobalCss from "../GlobalCss";
    import PageHeading from "../components/PageHeading";
    import Aspects from "../components/Aspects";
    import Vitals from "../components/Vitals";
    import Skills from "../components/Skills";
    import Stunts from "../components/Stunts";
    import RefreshAndFate from "../components/RefreshAndFate";
    import saveAs from 'file-saver';

    export let name;
    export let appSettings = {applicationName: "WARNING: Please pass appSettings from within main.js props."};
    import Dropzone from "svelte-file-dropzone";

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

    function newCharacter() {
        character = getNewCharacter();
    }

    function handleFilesSelect(e) {
        let files = e.detail.acceptedFiles;
        const reader = new FileReader();
        reader.onload = function(e) {
            // e.target.result should contain the text
            let text=e.target.result;
            character=JSON.parse(text);
        };
        reader.readAsText(files[0]);

    }

</script>
<style>
    @import "App.css";
</style>

<svelte:head>
    <title>{appSettings.applicationName}</title>
</svelte:head>

<GlobalCss/>
<div class="noprint" style="width:100%; height:50px;">
    <Dropzone on:drop={handleFilesSelect} />
</div>
<input class="noprint" type="button" on:click={newCharacter} value="New"/>
<input class="noprint" type="button" on:click={saveCharacter} value="Save"/>
<main>
    <PageHeading bind:name="{character.name}"/>
    <div class="table">

        <div class="tr">
            <div class="td border">
                <Aspects bind:aspects="{character.aspects}"/>
            </div>
            <div class="td">
                <Vitals bind:vitals="{character.vitals}"/>
            </div>
        </div>

        <div class="tr">
            <div class="td border">
                <Stunts bind:stunts="{character.stunts}"/>
                <RefreshAndFate bind:fate="{character.fate}" bind:refresh="{character.refresh}"/>
            </div>
            <div class="td">
                <Skills bind:skills={character.skills}/>
            </div>
        </div>
    </div>
</main>