<style>
    @import "Aspects.css";
</style>

<script>
    import Section from '../../shared/Section';
    import AspectEditor from '../../shared/AspectEditor'
    export let aspects={
        highConcept:"",
        trouble:"",
        relationship:"",
        otherAspects:["",""]
    };
    let rows=3;
</script>

<Section title="More Aspects" indent="0.75in" hint="Start with five aspects for free. You may buy additional aspects after a breakthrough for 1 refresh each, so long as your Refresh remains at 1 or above">
    {#each Array(14) as _,i}
        <AspectEditor bind:aspect={aspects.otherAspects[i+2]} {rows}/>
    {/each}

</Section>
