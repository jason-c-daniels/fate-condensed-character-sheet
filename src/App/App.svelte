<script>
    import "@webcomponents/webcomponentsjs/webcomponents-loader.js";
    import '@material/mwc-top-app-bar-fixed';
    import '@material/mwc-icon-button';
    import '@material/mwc-drawer';
    import '@material/mwc-tab';
    import '@material/mwc-tab-bar';
    import '@material/mwc-icon';
    import '@material/mwc-list';
    import '@material/mwc-list/mwc-list-item';
    import '@material/mwc-list/mwc-check-list-item';
    import '@material/mwc-list/mwc-radio-list-item';
    import '@material/mwc-snackbar';

    import GlobalCss from "../GlobalCss";
    import CharacterSheet from "../components/CharacterSheet";
    import SRD from "../components/SRD";
    import Markdown from '../components/shared/Markdown';

    import getNewCharacter from "../model/character"
    import downloadToClient from 'file-saver';
    import Dropzone from "svelte-file-dropzone";

    import LocalStorageController from '../controllers/localStorageController'

    export let name;
    export let appSettings = {applicationName: "WARNING: Please pass appSettings from within main.js props."};
    let activeIndex;
    let activeSection;
    let /*aspectsMarkdown, skillsMarkdown, stuntsMarkdown, */srdMarkdown, tocMarkdown;
/*    fetch("./md/Aspects.md").then((response) => response.text().then((data) => aspectsMarkdown = data));
    fetch("./md/Skills.md").then((response) => response.text().then((data) => skillsMarkdown = data));
    fetch("./md/Stunts.md").then((response) => response.text().then((data) => stuntsMarkdown = data));*/
    fetch("./md/Fate-Condensed-SRD-CC-BY.md").then((response) => response.text().then((data) => srdMarkdown = data));

    // Special DOM elements.
    let printOptionListElement,
            snackBarElement,
            saveOptionsListElement,
            tabBarElement;

    function handleTabActivated(e) {
        activeIndex = tabBarElement.activeIndex;
        activeSection = activeIndex === 0 ? "Character Sheet" : "Rules";
    }

    let disabled = "";
    let showLoadPane = false;
    let firstCall = true;
    let saveAlsoDownloads = true;
    let localStorageController = new LocalStorageController();
    let url=new URL(window.location);
    let basePath=url.origin+url.pathname;
    let snackBarText="Replace this with a real message";

    let {tmpChar, charIsValid} = doInitialCharacterLoad();

    let character = charIsValid ? tmpChar : getNewCharacter();
    if (url.searchParams.has('character')) {
        // now store it before we redirect
        localStorageController.saveCharacter(character);
        window.location.replace(basePath);
    }
    scheduleAutosave();

    function doInitialCharacterLoad() {
        let tmpChar;
        let charIsValid = false;
        try {
            tmpChar = (url.searchParams.has('character'))
                    ? JSON.parse(decodeURIComponent(url.searchParams.get("character")))
                    : localStorageController.loadCharacter();
            charIsValid = validateCharacter(tmpChar);
        } catch {
            charIsValid = false;
        }
        return {tmpChar, charIsValid};
    }

    function validateCharacter(validateMe) {
        let result=true;
        try {

            /* TODO: There has to be a better way.
                     like maybe a JSON DTD? */

            // for now try accessing things in a way that will throw an exception.
            let _ = validateMe.name.toString();
            _ = validateMe.fate.toString() ;
            _ = validateMe.refresh.toString() ;
            _ = validateMe.aspects.highConcept.toString() ;
            _ = validateMe.aspects.trouble.toString() ;
            _ = validateMe.aspects.relationship.toString() ;
            _ = validateMe.aspects.otherAspects[0].toString() ;
            _ = validateMe.aspects.otherAspects[1].toString() ;
            _ = validateMe.skills[18].name.toString() ;
            _ = validateMe.stunts[5].name.toString() ;
            _ = validateMe.vitals.physicalStressTaken.toString() ;
            _ = validateMe.vitals.mentalStressTaken.toString() ;
            _ = validateMe.vitals.consequences.mild1.toString() ;
            _ = validateMe.vitals.consequences.moderate.toString() ;
            _ = validateMe.vitals.consequences.severe.toString() ;
            _ = validateMe.vitals.consequences.mild2.toString() ;
        }
        catch(err) {
            console.log(err);
            setTimeout(()=> showSnackBar("Invalid data format encountered. Nothing loaded."),250);
            result=false;
        }
        finally {
        }
        return result;
    }

    function handleSaveCharacterClicked() {
        let blob = new Blob([JSON.stringify(character, null, 2)], {type: "text/plain;charset=utf-8"});
        localStorageController.saveCharacter(character);
        showSnackBar("Character saved to local storage.");
        if (true /*viewOptions.saveAlsoDownloads*/) {
            setTimeout(() => {
                let charsheet=`${character.name}.fcchar`;
                downloadToClient(blob, charsheet);
                showSnackBar(`Sending file: ${charsheet}. Check your downloads folder.`);
            }, 2000);
        }
    }

    function handleLoadCharacterClicked() {
        showLoadPane = true;
        disabled = "disabled";
    }

    function handleNewCharacterClicked() {
        character = getNewCharacter();
        activeIndex=0;
        showSnackBar("Created new character.");
    }

    function handleFilesSelect(e) {
        let files = e.detail.acceptedFiles;
        const reader = new FileReader();
        reader.onload = function (e) {
            // e.target.result should contain the text
            try {
                let text = e.target.result;
                let tmpChar = JSON.parse(text);
                if (validateCharacter(tmpChar)) {
                    setTimeout(() => showSnackBar("Character loaded from file."), 250);
                    character=tmpChar;
                    activeIndex=0;
                }
            }
            catch(err) {
                console.log(err);
                setTimeout(()=> showSnackBar("Invalid data format encountered. Nothing loaded."),250);
            }
            finally {
                hideLoadPane();
            }
        };
        reader.readAsText(files[0]);
    }

    function hideLoadPane() {
        showLoadPane = false;
        disabled = "";
    }

    function handlePrintClicked() {
        setTimeout(() => window.print(), 500);
    }

    function scheduleAutosave() {
        if (!firstCall) { return; }
        firstCall = false;
        if (typeof (Storage) === "undefined") { return; } // nothing to schedule since we can't get at local storage.
        setInterval(()=>localStorageController.saveCharacter(character), 5 * 1000);
    }

    function showSnackBar(text) {
        snackBarText=text;
        snackBarElement.show();
    }
</script>
<style>
    @import "App.css";
</style>

<svelte:head>
    <title>{character.name} - {appSettings.applicationName} - {activeSection}</title>

    <!-- Your application must load the Roboto and Material Icons fonts. -->
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
</svelte:head>
<GlobalCss/>

<main class="noprint">

    <mwc-top-app-bar-fixed style="height:100%">

        <div slot="title">
            <div style="display: inline-block"><span>{appSettings.applicationName} - {activeSection}</span></div>
        </div>
        <mwc-tab-bar slot="actionItems" style="display: inline-block" bind:this={tabBarElement} activeIndex={activeIndex} on:MDCTabBar:activated={handleTabActivated} >
            <mwc-tab label="Character Sheet"></mwc-tab>
            <mwc-tab label="Rules"></mwc-tab>
        </mwc-tab-bar>
        <mwc-icon-button icon="note_add" slot="actionItems" on:click={handleNewCharacterClicked} {disabled}></mwc-icon-button>
        {#if showLoadPane}
            <mwc-icon-button icon="cancel" slot="actionItems" on:click={hideLoadPane}></mwc-icon-button>
        {:else}
            <mwc-icon-button icon="folder_open" slot="actionItems" on:click={handleLoadCharacterClicked}></mwc-icon-button>
        {/if}
        <mwc-icon-button icon="save" slot="actionItems" on:click={handleSaveCharacterClicked} {disabled}></mwc-icon-button>
        <mwc-icon-button icon="print" slot="actionItems" on:click={handlePrintClicked} {disabled}></mwc-icon-button>

        {#if (showLoadPane)}
            <div id="content" class="noprint file-loader" style="height: 100%">
                <Dropzone on:drop={handleFilesSelect} containerStyles="height:92vh;color:#333333; background-color:#EFEFEF;"/>
            </div>
        {:else}
            <div id="content" style="margin: 10pt;">
            {#if activeIndex === 0}
                <div class="page">
                    <CharacterSheet bind:character={character}/>
                </div>
            {:else if activeIndex === 1}
                <SRD bind:tocMarkdown bind:srdMarkdown />
            {:else}
                <h3>TBD/Coming Soon</h3>
            {/if}
                <mwc-snackbar labelText="{snackBarText}" bind:this={snackBarElement}>
                    <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
                </mwc-snackbar>
            </div>
        {/if}
    </mwc-top-app-bar-fixed>

</main>

<main class="printme" style="margin: 0.5in">
    <!-- This section is intended for print rendering only. You may suppress the rendering of this entire section
         to HTML if you like, but you'll need to ensure it's been rendered right before the print dialog is invoked.
         (i.e. print() )
     -->
    <div class="page">
        <CharacterSheet bind:character={character}/>
    </div>
</main>