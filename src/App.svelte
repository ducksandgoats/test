<script>
  import {Container} from '@sveltestrap/sveltestrap'
  import Router from 'svelte-spa-router'
  import Err from './lib/Error.svelte'
  import Dexie from './lib/Dexie.svelte'
  import Gun from './lib/Gun.svelte'
  import Msg from './lib/Msg.svelte'
  import Pubsub from './lib/Pubsub.svelte'
  import Topic from './lib/Topic.svelte'
  import Home from './lib/Home.svelte'
  import NavBar from './lib/Nav.svelte'
  import VidMsg from './lib/VidMsg.svelte'
  import VidPubsub from './lib/VidPubsub.svelte'
  import VidTopic from './lib/VidTopic.svelte'
  const routes = {
    // Exact path
    '/': Home,
    '/dexie': Dexie,

    // Using named parameters, with last being optional
    '/gun': Gun,

    // Wildcard parameter
    '/msg': Msg,
    '/pubsub': Pubsub,
    '/topic': Topic,
    '/vidmsg': VidMsg,
    '/vidpubsub': VidPubsub,
    '/vidtopic': VidTopic,

    // Catch-all
    // This is optional, but if present it must be the last
    '*': Err,
}
</script>

<Container fluid>
  <NavBar/>
  <Router {routes}/>
</Container>

<style>
  /* body {

  } */
</style>
