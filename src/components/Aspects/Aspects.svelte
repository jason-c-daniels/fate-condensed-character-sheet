<style>
    @import "Aspects.css";
</style>

<script>
    import Section from '../Section';
    export let aspects={
        highConcept:"",
        trouble:"",
        relationship:"",
        otherAspects:["",""]
    };
    let rows=2;
</script>

<Section title="Aspects" indent="0.75in">
    <div class="aspect">
    <label class="aspect-label">
        <span>High Concept</span>
    </label>
        <textarea placeholder="Please describe the character concept."
                  bind:value="{aspects.highConcept}"
                  rows="{rows}"
        ></textarea>
    </div>

    <div class="aspect">
    <label class="aspect-label">
        <span>Trouble</span>
    </label>
        <textarea placeholder="Please describe the character's trouble."
                  bind:value="{aspects.trouble}"
                  rows="{rows}"
        ></textarea>
    </div>
    <div class="aspect">
    <label class="aspect-label">
        <span>Relationship</span>
    </label>
        <textarea placeholder="Please describe the relationship"
                  bind:value="{aspects.relationship}"
                  rows="{rows}"
        ></textarea>
    </div>
    <div class="aspect">
    <label class="aspect-label">
        <span>Other Aspect</span>
    </label>
        <textarea placeholder="Please describe the character concept."
                  bind:value="{aspects.otherAspects[0]}"
                  rows="{rows}"
        ></textarea>
    </div>
    <div class="aspect">
    <label class="aspect-label">
        <span>Other Aspect</span>
    </label>
        <textarea placeholder="Please describe the character concept."
                  bind:value="{aspects.otherAspects[1]}"
                  rows="{rows}"
        ></textarea>
    </div>
</Section>
