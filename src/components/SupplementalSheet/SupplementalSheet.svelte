<style>
    @import "SupplementalSheet.css";
</style>

<script>
    import Aspects from './Aspects'
    import Stunts from './Stunts'
    import PageHeading from "../CharacterSheet/PageHeading";
    import getNewCharacter from '../../model/character';

    export let character=getNewCharacter();

</script>

<div class="page">
    <div class="supplemental-sheet">
        <PageHeading bind:name="{character.name}" bind:player={character.player} bind:species={character.species} bind:role={character.role}/>
        <div class="table">

            <div class="tr">
                <div class="td border" style="width:50%">
                    <Aspects bind:aspects="{character.aspects}"/>
                </div>
                <div class="td ">
                    <Stunts bind:stunts="{character.stunts}"/>
                </div>
            </div>
        </div>
    </div>
</div>