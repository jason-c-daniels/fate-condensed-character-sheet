<style>
    @import "Stunts.css";
</style>

<script>
    import Section from '../../shared/Section';
    import StuntEditor from '../../shared/StuntEditor';

    export let stunts = [
        {name: "", description: ""},
        {name: "", description: ""},
        {name: "", description: ""},
        {name: "", description: ""},
        {name: "", description: ""},
        {name: "", description: ""}
    ];
    let rows = 3;
    let stuntsHint = "Start with three stunts for free. You may buy additional stunts for 1 Refresh each, so long as your Refresh remains at 1 or above."
</script>

<Section title="More Stunts" hint="{stuntsHint}" indent="0.75in">
    {#each Array(12) as _,i}
        <StuntEditor bind:stunt={stunts[i+6]} {rows} />
    {/each}
</Section>