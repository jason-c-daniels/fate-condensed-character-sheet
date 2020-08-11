<style>
    @import "PageHeading.css";
</style>

<script>
    import Logo from "./logo.svg"
    export let name="";
</script>


<div class="table">
    <div class="tr">
        <div class="td top">
            <span class="name-label">Name</span>
        </div>
        <div class="td bottom">
                <input  class="name-input"
                        type="text"
                        placeholder="Please enter a name"
                        bind:value="{name}"
                        style="" />
        </div>
        <div class="td bottom">
            <div class="logo">
                <Logo height="100%" width="100%" />
            </div>
        </div>
    </div>
</div>

