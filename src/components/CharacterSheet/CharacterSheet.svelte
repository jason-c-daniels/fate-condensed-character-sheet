<style>
    @import "CharacterSheet.css";
</style>

<script>
    import PageHeading from "./PageHeading";
    import Aspects from "./Aspects";
    import Vitals from "./Vitals";
    import Skills from "./Skills";
    import Stunts from "./Stunts";
    import RefreshAndFate from "./RefreshAndFate";
    export let character;
    window.scrollTo(0,0);
</script>
<div class="page">
<div class="character-sheet">
    <PageHeading bind:name="{character.name}" bind:player={character.player} bind:species={character.species} bind:role={character.role}/>
    <div class="table">

        <div class="tr">
            <div class="td border">
                <Aspects bind:aspects="{character.aspects}"/>
            </div>
            <div class="td" style="width: 40.8%">
                <Vitals bind:vitals="{character.vitals}" bind:will={character.skills[18].value} bind:physique={character.skills[12].value}/>
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
</div>
</div>