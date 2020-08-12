<style>
    @import "CheckedItem.css";
</style>
<script context="module">
    export const defaultCss = {
        color: "black",
        backgroundColor: "transparent",
        size: "1.45em",
        borderWidth: "1.0pt"
    };
</script>
<script>
    import {createEventDispatcher} from 'svelte'
    import Check from './small-check.svg';
    export let number = 1;
    export let css = defaultCss;
    export let checked;
    const dispatch = createEventDispatcher();

    function handleClick() {
        checked = !checked;
        dispatch('checkedChanged', { checked: checked });
    }
</script>

<div
        class="box"
        style="color:{css.color}; width:{css.size}; height:{css.size}; border-width:{css.borderWidth};
  border-color:{css.color}; border-style:solid; background-color:{css.backgroundColor};" on:click={handleClick}>
    <div class="check-text" style="width:{css.size}; height:{css.size};">
    <span>
      {number}
    </span>
    </div>
    {#if checked}
        <div class="checkmark" style="width:100%; height:100%;">
            <div>
                <Check width="{css.size}" height="{css.size}"/>
            </div>
        </div>
    {/if}
</div>
