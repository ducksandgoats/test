<script>
	import { onMount } from 'svelte'
  const id = crypto.randomUUID()

  async function func(){
    const test = await fetch('topic://testing')
    for await (const message of test.body){
      const obj = JSON.parse(new TextDecoder().decode(message))
      if(obj.proc === 'start'){
          console.log(obj)
          if(!document.getElementById(obj.id)){
            const makeEl = document.createElement('video')
            makeEl.id = obj.id
            document.getElementById('test').append(makeEl)
          }
      }
      if(obj.proc === 'stop'){
        console.log(obj)
        const el = document.getElementById(obj.id)
        if(el){
          el.remove()
        }
      }
      if(obj.proc === 'pause'){
        console.log(obj)
        const el = document.getElementById(obj.id)
        if(el){
          el.pause()
        }
      }
      if(obj.proc === 'resume'){
        console.log(obj)
        const el = document.getElementById(obj.id)
        if(el){
          el.play()
        }
      }
      if(obj.proc === 'data'){
        console.log(obj)
        const el = document.getElementById(obj.id)
        if(el){
          el.src = window.URL.createObjectURL(new Blob( [obj.data], {'type': 'video/mp4' }));
        }
      }
    }
  }

  func().then(console.log).catch(console.error)
	let mediaRecorder = null;
	onMount(async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
		
		mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('start', async () => {
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'start', id})})).text())
    })
    mediaRecorder.addEventListener('resume', async () => {
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'resume', id})})).text())
    })
    mediaRecorder.addEventListener('pause', async () => {
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'pause', id})})).text())
    })
    mediaRecorder.addEventListener('stop', async () => {
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'stop', id})})).text())
    })
		mediaRecorder.addEventListener('dataavailable', async (ev) => {
			document.getElementById('own').src = window.URL.createObjectURL(new Blob( [ev.data], {'type' : 'video/mp4' }));
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'data', id, data: await ev.data.text()})})).text())
    })
	})
	
	function startSending(){
		mediaRecorder.start();
	}

	function stopSending(){
		mediaRecorder.stop();
	}

	function resumeSending(){
		mediaRecorder.start();
	}

	function pauseSending(){
		mediaRecorder.stop();
	}

</script>

<section>
	<h2>Video Board</h2>
	<video controls id="own"><track kind="captions"/></video>
	<button on:click={startSending}>Record</button>
	<button on:click={stopSending}>Stop</button>
	<button on:click={resumeSending}>Record</button>
	<button on:click={pauseSending}>Stop</button>
</section>

<section id="test"></section>

<style>
	section{
		display: flex;
		flex-flow: column;
		width: 300px;
	}
</style>