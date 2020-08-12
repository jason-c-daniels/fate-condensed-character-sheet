<style>
    @import "RefreshAndFate.css";
</style>

<script>
    export let refresh=3;
    export let fate=3;
</script>


<div class="header" >
    <div style="display: inline-block">&nbsp;</div>
    <div class="refresh-points">
        <input
                maxlength="1"
                class="circle"
                type="number"
                step={1}
                min={0}
                max={10}
                bind:value={refresh}
        />
    </div>
    <div class="refresh-label">
        <span style="margin-left:5.3em">Refresh</span>
    </div>
    <div class="fate-label">
        <span style="margin-right:5.3em">Fate</span>
    </div>
    <div class="fate-points">
        <input
                maxlength="1"
                class="circle"
                type="number"
                step={1}
                min={0}
                max={10}
                bind:value={fate}
        />
    </div>
</div>
