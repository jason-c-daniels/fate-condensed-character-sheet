<style>
    @import "StressTrack.css";
</style>
<script>
    import CheckedItem, {defaultCss as CSS} from "../CheckedItem/CheckedItem.svelte";
    export let title = "Physical";
    // export let idBase = title.toLocaleLowerCase().replace(" ", "_") + "_";
    export let count = 6;
    let css={...CSS,color:'black'};
    let grayCss={...css,color:'gray'}

</script>


<div class="row">
    <div class="title-column stress-track-title">
        <span>{title}</span>
    </div>

    {#each Array(count) as _, i}
        <div class="column">
            <CheckedItem css="{i < 3 ? css : grayCss}" number="1"/>
        </div>
    {/each}
    <div class=".last-col">
        <span style="width: 1.4em;"></span>
    </div>
</div>
