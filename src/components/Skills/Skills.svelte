<style>
    @import "Skills.css";
</style>

<script>
    import Section from '../Section';
    export let skills=[
        {name:"Academics",value:0},
        {name:"Athletics",value:0},
        {name:"Burglary",value:0},
        {name:"Contacts",value:0},
        {name:"Crafts",value:0},
        {name:"Deceive",value:0},
        {name:"Drive",value:0},
        {name:"Empathy",value:0},
        {name:"Fight",value:0},
        {name:"Investigate",value:0},
        {name:"Lore",value:0},
        {name:"Notice",value:0},
        {name:"Physique",value:0},
        {name:"Provoke",value:0},
        {name:"Rapport",value:0},
        {name:"Resources",value:0},
        {name:"Shoot",value:0},
        {name:"Stealth",value:0},
        {name:"Will",value:0}
    ];

    let skillsHint="Start with one Great (+4), two Good (+3), three Fair (+2), four Average (+1), rest at Mediocre (=0)"
</script>

<Section title="Skills" hint="{skillsHint}">

    {#each skills as skill}
        <div class="skill-line">
            <span>+</span>
            <input type="number" class="skill-value" min="0" max="10" bind:value={skill.value}/>
            <label>{skill.name}</label>
        </div>
    {/each}

</Section>
