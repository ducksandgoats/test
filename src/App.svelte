<script>
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'

  import dexieFunc from './dir/dexie.js'
  import gunFunc from './dir/gun.js'

  const database = dexieFunc({debug: true, version: 1, url: 'ws://198.46.188.206:10509/signal', hash: '7e6520e2fe505702ec644226ccb0a8bc467c5a2c', name: 'test', schema: {working: 'id, connection, try'}})
  const gun = gunFunc({url: 'ws://107.173.15.203:10509/signal', hash: '7e6520e2fe505702ec644226ccb0a8bc467c5a2c', debug: true})
  let test = 0
  setInterval(() => {
    test = test + 1
    gun.get('testing' + test).put({test: 'works'}).once(console.log)
    database.crud.add('working', {id: `${test}${Date.now()}`, connection: 'connected', try: 'tried', test})
  }, 5000)
</script>

<main>
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>

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
