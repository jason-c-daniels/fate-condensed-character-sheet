<style>
    @import "SRD.css";
</style>

<script>
    import '@material/mwc-icon-button'

    import TOC from './TOC.md'
    import Srd from './SrdContent.md'

    let showToc= window.innerWidth > 15.25*6.022*16; //(inches*em/inch*px/em)

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

        {#if showToc}
            <h2>Table of Contents</h2>
                <TOC />
        {/if}
    </div>
<div class="this-page">
    <Srd />
</div>



