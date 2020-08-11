<style>
    @import "Vitals.css";
</style>

<script>
    import StressTrack from "./StressTrack";
    import Consequence from "./Consequence";
    import Section from '../Section';
    export let vitals={
        physicalStressTaken:0,
        mentalStressTaken:0,
        consequences:{
            mild1:"",
            moderate:"",
            severe:"",
            mild2:"",
        }
    };
    export let will=0;
    export let physique=0;


    export let height = "auto";
    export let stressTracks = [{ name: "Physical" }, { name: "Mental" }];
    export let consequences = [
        { name: "Mild", value: 2, isExtra: false, description:"" },
        { name: "Moderate", value: 4, isExtra: false, description:"" },
        { name: "Severe", value: 6, isExtra: false, description:"" },
        { name: "Mild", value: 2, isExtra: true, description:"" }
    ];
</script>

<Section title="Vitals" {height}>
    <div class="row subheading">
        <span>STRESS</span>
    </div>
    <div class="box">
        {#each stressTracks as track, i}
            <StressTrack title="{track.name}" />
        {/each}
    </div>
    <div class="row subheading" style="margin-top:10px">
        <span style="font-weight:bold">CONSEQUENCES</span>
    </div>

    {#each consequences as consequence, i}
    <!--    <Consequence {...consequence} />-->
    {/each}
</Section>
