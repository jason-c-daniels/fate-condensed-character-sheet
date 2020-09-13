<style>
    @import "SRD.css";
</style>

<script>
    import '@material/mwc-icon-button'
    import marked from 'marked';
    import Markdown from '../shared/Markdown';
    export let srdMarkdown;
    export let tocMarkdown;
    let showToc= window.innerWidth > 15.25*6.022*16; //(inches*em/inch*px/em)
    if (!srdMarkdown) {
        fetch("./md/Fate-Condensed-SRD-CC-BY.md").then((response) => response.text().then((data) => srdMarkdown = data));
    }
    if (!tocMarkdown) {
        fetch("./md/SRD-TOC.md").then((response) => response.text().then((data) => tocMarkdown = data));
    }

    if (window.location.hash) {
        setTimeout(() => {
            document.getElementById(window.location.hash.replace("#","")).scrollIntoView();
        }, 250);
    }
</script>


    <div class="toc">

        {#if showToc}
            <mwc-icon-button style="float:right" icon="chevron_left" on:click={()=> showToc=false} ></mwc-icon-button>
        {:else}
            <mwc-icon-button icon="chevron_right" on:click={()=> showToc=true} ></mwc-icon-button>
        {/if}

        {#if tocMarkdown && showToc}
            <h2>Table of Contents</h2>
            {@html marked(tocMarkdown)}
        {/if}
    </div>
    <div >
        {#if srdMarkdown}
            <Markdown markdown={srdMarkdown} columns="1" props={{style:"line-height:1.2rem;"}}/>
        {/if}
    </div>

