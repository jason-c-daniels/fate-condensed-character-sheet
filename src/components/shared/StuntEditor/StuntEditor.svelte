<style>
    @import "StuntEditor.css";
</style>

<script>
    export let stunt={name:"",description:""};
    export let rows=2;
</script>

<div class="stunt">
    <input type="text" class="name-input" placeholder="Please name the stunt." bind:value={stunt.name}/>
    <textarea placeholder="Please describe the stunt."
              bind:value="{stunt.description}"
              rows="{rows}"></textarea>
</div>