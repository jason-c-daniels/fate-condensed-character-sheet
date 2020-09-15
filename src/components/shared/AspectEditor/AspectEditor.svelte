<style>
    @import "AspectEditor.css";
</style>

<script>
    export let aspect="";
    export let rows=2;
</script>

<div class="aspect">
    <label class="aspect-label">
        <span>Other Aspect</span>
    </label>
    <textarea placeholder="Please describe the aspect."
              bind:value="{aspect}"
              rows="{rows}"
    ></textarea>
</div>