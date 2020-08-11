<style>
    @import "StressTrack.css";
</style>
<script>
    import CheckedItem, {defaultCss as CSS} from "../CheckedItem/CheckedItem.svelte";
    export let title = "Physical";
    export let stressTaken=0;
    export let count = 3;
    let css={...CSS,color:'black'};
    let grayCss={...css,color:'gray'};

    function handleCheckedChanged(event) {
        stressTaken += event.detail.checked ? 1 : -1;
    }
</script>


<div class="row">
    <div class="title-column stress-track-title">
        <span>{title}</span>
    </div>

    {#each Array(count) as _, i}
        <div class="column">
            <CheckedItem css="{i < 3 ? css : grayCss}" number="1" checked="{i < stressTaken}" on:checkedChanged={handleCheckedChanged}/>
        </div>
    {/each}
    <div class=".last-col">
        <span style="width: 1.4em;"></span>
    </div>
</div>
