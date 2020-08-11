<style>
    @import "Consequence.css";
</style>

<script>
    import CheckedItem, {defaultCss as CSS} from "../CheckedItem/CheckedItem.svelte";
    export let name = "Mild";
    export let value = 2;
    export let isExtra = false;
    export let description = "";
    // export let idBase = name.toLocaleLowerCase().replace(" ", "_") + "_";
    let css={...CSS,color:'black'};
    let grayCss={...css,color:'gray'}

</script>

<div class="row">

    <div class="column">
        <CheckedItem css="{isExtra ? grayCss : css}" number="{value}"/>
    </div>
    <div class="column" style="padding-left:1em; width:90%;">
        <MultilineInput title="{name}" text="{description}" rows="1" fontSize="9pt" width="100%"/>
    </div>
</div>
