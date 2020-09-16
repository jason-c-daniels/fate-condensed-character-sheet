<style>
    @import "PageHeading.css";
</style>

<script>
    import Logo from "./logo.svg"

    export let name = "";
    export let player = "";
    export let role = "";
    export let species = "";

</script>

<div class="container" >
    <div class="flex-column col gap" style="width: 40%">
        <div class="flex-row flex-item-1 bottom-line">
            <label class="name-label" for="character-name">Name</label>
            <input id="character-name"
                   class="name-input"
                   type="text"
                   placeholder="Character name"
                   bind:value="{name}"
                   style="width: 100%"
            />

        </div>
        <div class="flex-row flex-item-1" >
            <label class="name-label" for="player-name">Player</label>
            <input id="player-name"
                   class="name-input"
                   type="text"
                   placeholder="Player name"
                   bind:value="{player}"
                   style="width: 100%"
            />

        </div>
    </div>

    <div class="flex-column col gap" style="width: 30%">
        <div class="flex-row flex-item-1 bottom-line">
            <label class="name-label" for="species-name">Species</label>
            <input id="species-name"
                   class="name-input"
                   type="text"
                   placeholder="Species name"
                   bind:value="{species}"
                   style="width: 100%"
            />

        </div>
        <div class="flex-row flex-item-1" >
            <label class="name-label" for="role-name">Role</label>
            <input id="role-name"
                   class="name-input"
                   type="text"
                   placeholder="Role name"
                   bind:value="{role}"
                   style="width: 100%"
            />
        </div>
    </div>
    <div class="logo col">
        <Logo height="100%" width="100%"/>
    </div>
</div>

