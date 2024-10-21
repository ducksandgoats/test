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

    // Catch-all
    // This is optional, but if present it must be the last
    '*': Err,
}
</script>

<Container>
  <NavBar/>
  <Router {routes}/>
</Container>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
