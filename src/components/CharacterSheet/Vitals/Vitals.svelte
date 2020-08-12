<style>
    @import "Vitals.css";
</style>

<script>
    import StressTrack from "./StressTrack";
    import Consequence from "./Consequence";
    import Section from '../Section';

    export let vitals = {
        physicalStressTaken: 0,
        mentalStressTaken: 0,
        consequences: {
            mild1: "",
            moderate: "",
            severe: "",
            mild2: "",
        }
    };
    export let will = 0;
    export let physique = 0;
    function getStressTrackCount(attr){
        if (attr > 0) {
            if (attr > 2)  {
                return 6;
            }
                return 4;
        }
        return 3;
    }
</script>

<Section title="Vitals">
    <div class="row subheading">
        <span>STRESS</span>
    </div>
    <div style="margin-left:2em">
        <!-- TODO: account for physique and will below -->
        <StressTrack title="Physical" bind:stressTaken="{vitals.physicalStressTaken}"
                     count="{getStressTrackCount(physique)}"/>
        <StressTrack title="Mental" bind:stressTaken="{vitals.mentalStressTaken}"
                     count="{getStressTrackCount(will)}"/>
    </div>

    <div class="row subheading" style="margin-top:10px">
        <span style="font-weight:bold">CONSEQUENCES</span>
    </div>

    <Consequence name="Mild" isExtra="false" value="2" bind:description="{vitals.consequences.mild1}"/>
    <Consequence name="Moderate" isExtra="false" value="4" bind:description="{vitals.consequences.moderate}"/>
    <Consequence name="Severe" isExtra="false" value="6" bind:description="{vitals.consequences.severe}"/>
    {#if (will > 4 || physique > 4)}
        <Consequence name="Mild" isExtra="true" value="2" bind:description="{vitals.consequences.mild2}"/>
    {/if}
</Section>
