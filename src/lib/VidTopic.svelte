<script>
	// import { onMount } from 'svelte'
  import {Button, Input} from '@sveltestrap/sveltestrap'
  const id = crypto.randomUUID()

  let videoOrAudio = null
  let secondsOfSegment = 5
  let opt = 'none'
  let save = null

  async function func(){
    const test = await fetch('topic://testing')
    for await (const message of test.body){
      const obj = JSON.parse(new TextDecoder().decode(message))
      if(obj.proc === 'start'){
          console.log(obj)
          if(!document.getElementById(obj.id)){
            const makeEl = obj.vid ? document.createElement('video') : document.createElement('audio')
            makeEl.id = obj.id
            document.getElementById('test').append(makeEl)
          }
          if(save){
            if(!save[obj.user]){
              save[obj.user] = ''
            }
          }
      }
      if(obj.proc === 'stop'){
        console.log(obj)
        const el = document.getElementById(obj.id)
        if(el){
          el.remove()
        }
        if(save){
          if(save[obj.user]){
            try {
              if(opt === 'bt'){
                console.log(await (await fetch(`bt://./testing/${obj.user}`, {method: 'POST', body: save[obj.user]})).text())
              }
              if(opt === 'ipfs'){
                console.log(await (await fetch(`ipfs://./testing/${obj.user}`, {method: 'POST', body: save[obj.user]})).text())
              }
              if(opt === 'hyper'){
                console.log(await (await fetch(`ipfs://_/testing/${obj.user}`, {method: 'POST', body: save[obj.user]})).text())
              }
            } catch (error) {
              console.error(error) 
            }
          }
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
        const test = new Blob([obj.data], {'type': obj.mimeType })
        if(el){
          el.src = window.URL.createObjectURL(test);
        } else {
          const makeEl = obj.kind ? document.createElement('video') : document.createElement('audio')
          makeEl.id = obj.user
          document.getElementById('test').append(makeEl)
          makeEl.src = window.URL.createObjectURL(test)
        }
        if(save){
          if(save[obj.user]){
            if(save[obj.user]){
              save[obj.user] = save[obj.user] + await test.text()
            } else {
              save[obj.user] = await test.text()
            }
          }
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
  //     console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'start', vid, id, mime: mediaRecorder.mimeType})})).text())
  //   })
  //   mediaRecorder.addEventListener('resume', async () => {
  //     console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'resume', vid, id, mime: mediaRecorder.mimeType})})).text())
  //   })
  //   mediaRecorder.addEventListener('pause', async () => {
  //     console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'pause', vid, id, mime: mediaRecorder.mimeType})})).text())
  //   })
  //   mediaRecorder.addEventListener('stop', async () => {
  //     console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'stop', vid, id, mime: mediaRecorder.mimeType})})).text())
  //   })
	// 	mediaRecorder.addEventListener('dataavailable', async (ev) => {
	// 		document.getElementById('own').src = window.URL.createObjectURL(ev.data);
  //     console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'data', vid, id, mime: mediaRecorder.mimeType, data: await ev.data.text()})})).text())
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
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'start', vid, id, mime: mediaRecorder.mimeType})})).text())
    })
    mediaRecorder.addEventListener('resume', async () => {
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'resume', vid, id, mime: mediaRecorder.mimeType})})).text())
    })
    mediaRecorder.addEventListener('pause', async () => {
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'pause', vid, id, mime: mediaRecorder.mimeType})})).text())
    })
    mediaRecorder.addEventListener('stop', async () => {
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'stop', vid, id, mime: mediaRecorder.mimeType})})).text())
    })
		mediaRecorder.addEventListener('dataavailable', async (ev) => {
			document.getElementById('own').src = window.URL.createObjectURL(ev.data);
      console.log(await (await fetch('topic://testing', {method: 'POST', body: JSON.stringify({proc: 'data', vid, id, mime: mediaRecorder.mimeType, data: await ev.data.text()})})).text())
    })
	}
	
	function startSending(){
		mediaRecorder.start(secondsOfSegment);
	}

	function stopSending(){
		mediaRecorder.stop();
	}

	function resumeSending(){
		mediaRecorder.resume();
	}

	function pauseSending(){
		mediaRecorder.pause();
	}

</script>

<section>
  <Input type="select" bind:value={opt}>
    {#each ['none', 'bt', 'ipfs', 'hyper'] as option}
      <option>{option}</option>
    {/each}
  </Input>
  <Button on:click={(e) => {
    console.log(e);
    if(opt === 'none'){
      if(save){
        for(const p in save){
          delete save[p]
        }
      }
      save = null
    } else {
      save = {}
    }
    }}>Save</Button>
</section>

{#if videoOrAudio === null}
  <section>
    <Button on:click={(e) => {console.log(e);videoOrAudio = true;testFunc(videoOrAudio);}}>Video</Button><Button on:click={(e) => {console.log(e);videoOrAudio = false;testFunc(videoOrAudio);}}>Audio</Button>
    <Input type="number" placeholder="choose how many seconds of data segments to use" min={1} max={9} step={1} bind:value={secondsOfSegment}/>
  </section>
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