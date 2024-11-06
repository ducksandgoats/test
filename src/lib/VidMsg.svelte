<script>
	// import { onMount } from 'svelte'
  import {Button} from '@sveltestrap/sveltestrap'
  const id = crypto.randomUUID()

  let videoOrAudio = null

  async function func(){
    const test = await fetch('msg://testing')
    for await (const message of test.body){
      const obj = JSON.parse(new TextDecoder().decode(message))
      if(obj.proc === 'start'){
          console.log(obj)
          if(!document.getElementById(obj.id)){
            const makeEl = obj.vid ? document.createElement('video') : document.createElement('audio')
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
          el.src = window.URL.createObjectURL(new Blob( [obj.data], {'type': obj.mimeType }));
        }
      }
    }
  }

  // let obj
  // let vid
  // function initFunc(use){
  //   const obj = use ? { audio: true, video: true } : { audio: true, video: false }
  //   const vid = obj.video && obj.audio ? true : false
  // }
  // func().then(console.log).catch(console.error)
	// let mediaRecorder = null;
	// onMount(async () => {
	// 	const stream = await navigator.mediaDevices.getUserMedia(obj);
		
	// 	mediaRecorder = new MediaRecorder(stream);
  //   mediaRecorder.addEventListener('start', async () => {
  //     console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'start', vid, id, mime: mediaRecorder.mimeType})})).text())
  //   })
  //   mediaRecorder.addEventListener('resume', async () => {
  //     console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'resume', vid, id, mime: mediaRecorder.mimeType})})).text())
  //   })
  //   mediaRecorder.addEventListener('pause', async () => {
  //     console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'pause', vid, id, mime: mediaRecorder.mimeType})})).text())
  //   })
  //   mediaRecorder.addEventListener('stop', async () => {
  //     console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'stop', vid, id, mime: mediaRecorder.mimeType})})).text())
  //   })
	// 	mediaRecorder.addEventListener('dataavailable', async (ev) => {
	// 		document.getElementById('own').src = window.URL.createObjectURL(ev.data);
  //     console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'data', vid, id, mime: mediaRecorder.mimeType, data: await ev.data.text()})})).text())
  //   })
	// })

  async function testFunc(use){
    const obj = use ? { audio: true, video: true } : { audio: true, video: false }
    const vid = obj.video && obj.audio ? true : false
    func().then(console.log).catch(console.error)
    let mediaRecorder = null;
		const stream = await navigator.mediaDevices.getUserMedia(obj);
		
		mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('start', async () => {
      console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'start', vid, id, mime: mediaRecorder.mimeType})})).text())
    })
    mediaRecorder.addEventListener('resume', async () => {
      console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'resume', vid, id, mime: mediaRecorder.mimeType})})).text())
    })
    mediaRecorder.addEventListener('pause', async () => {
      console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'pause', vid, id, mime: mediaRecorder.mimeType})})).text())
    })
    mediaRecorder.addEventListener('stop', async () => {
      console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'stop', vid, id, mime: mediaRecorder.mimeType})})).text())
    })
		mediaRecorder.addEventListener('dataavailable', async (ev) => {
			document.getElementById('own').src = window.URL.createObjectURL(ev.data);
      console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({proc: 'data', vid, id, mime: mediaRecorder.mimeType, data: await ev.data.text()})})).text())
    })
	}
	
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

{#if videoOrAudio === null}
  <section><Button on:click={(e) => {console.log(e);videoOrAudio = true;testFunc(videoOrAudio);}}>Video</Button><Button on:click={(e) => {(e) => {console.log(e);videoOrAudio = false;testFunc(videoOrAudio);}}}>Audio</Button></section>
{/if}

{#if videoOrAudio === true}
<section>
	<h2>Video Board</h2>
	<video controls id="own"><track kind="captions"/></video>
	<button on:click={startSending}>Record</button>
	<button on:click={stopSending}>Stop</button>
	<button on:click={resumeSending}>Record</button>
	<button on:click={pauseSending}>Stop</button>
</section>
{/if}

{#if videoOrAudio === false}
<h2>Audio Board</h2>
<audio controls id="own"></audio>
<button on:click={startSending}>Record</button>
<button on:click={stopSending}>Stop</button>
<button on:click={resumeSending}>Record</button>
<button on:click={pauseSending}>Stop</button>
{/if}

<section id="test"></section>

<style>
	section{
		display: flex;
		flex-flow: column;
		width: 300px;
	}
</style>