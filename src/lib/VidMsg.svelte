<script>
	// import { onMount } from 'svelte'
  import {Button, Input} from '@sveltestrap/sveltestrap'
  const id = crypto.randomUUID()

  let secondsOfSegment = 5
  let mediaRecorder = null
  let videoOrAudio = null
  let working = false
  let plays = false
  let opt = 'none'
  let save = null

  async function func(){
    const test = await fetch('msg://testing')
    for await (const i of test.body){
      let obj = new TextDecoder().decode(i)
      obj = obj.slice(obj.indexOf(':') + 1)
      obj = JSON.parse(obj)
      if(obj.state){
        if(obj.state === 'start'){
            const el = document.getElementById(obj.user)
            if(el){
                el.play()
            } else {
                const makeEl = obj.kind ? document.createElement('video') : document.createElement('audio')
                makeEl.id = obj.user
                document.getElementById('test').append(makeEl)
                makeEl.play()
            }
            if(save){
              if(!save[obj.user]){
                save[obj.user] = ''
              }
            }
        }
        if(obj.state === 'stop'){
            const el = document.getElementById(obj.user)
            if(el){
                el.pause()
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
        if(obj.state === 'resume'){
            const el = document.getElementById(obj.user)
            if(el){
                el.play()
            } else {
                const makeEl = obj.kind ? document.createElement('video') : document.createElement('audio')
                makeEl.id = obj.user
                document.getElementById('test').append(makeEl)
                makeEl.play()
            }
        }
        if(obj.state === 'pause'){
            const el = document.getElementById(obj.user)
            if(el){
                el.pause()
            } else {
                const makeEl = obj.kind ? document.createElement('video') : document.createElement('audio')
                makeEl.id = obj.user
                document.getElementById('test').append(makeEl)
                makeEl.pause()
            }
        }
        }
        if(obj.data){
            const el = document.getElementById(obj.user)
            const test = new Blob([obj.data], {'type': obj.mime})
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

  async function testFunc(){
    const obj = videoOrAudio ? { audio: true, video: true } : { audio: true, video: false }
    const vid = obj.video && obj.audio ? true : false
    func().then(console.log).catch(console.error)
    mediaRecorder = null;
		const stream = await navigator.mediaDevices.getUserMedia(obj);
		
		mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('error', (ev) => {
      console.error(ev.error)
    })
    mediaRecorder.addEventListener('start', async () => {
        console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({state: 'start', kind: vid, user: id, mime: mediaRecorder.mimeType})})).text())
    })
    mediaRecorder.addEventListener('resume', async () => {
        console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({state: 'resume', kind: vid, user: id, mime: mediaRecorder.mimeType})})).text())
    })
    mediaRecorder.addEventListener('pause', async () => {
        console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({state: 'pause', kind: vid, user: id, mime: mediaRecorder.mimeType})})).text())
    })
    mediaRecorder.addEventListener('stop', async () => {
        console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({state: 'stop', kind: vid, user: id, mime: mediaRecorder.mimeType})})).text())
    })
		mediaRecorder.addEventListener('dataavailable', async (ev) => {
			document.getElementById('own').src = window.URL.createObjectURL(ev.data);
      console.log(await (await fetch('msg://testing', {method: 'POST', body: JSON.stringify({data: await ev.data.text(), kind: videoOrAudio, user: id, mime: mediaRecorder.mimeType})})).text())
    })
	}
	
	function startSending(){
		mediaRecorder.start(secondsOfSegment);
    working = true
    plays = true
	}

	function stopSending(){
		mediaRecorder.stop();
    working = false
    plays = false
	}

	function resumeSending(){
		mediaRecorder.resume();
    plays = true
	}

	function pauseSending(){
		mediaRecorder.pause();
    plays = false
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
    <Button on:click={(e) => {console.log(e);videoOrAudio = true;testFunc();}}>Video</Button><Button on:click={(e) => {console.log(e);videoOrAudio = false;testFunc();}}>Audio</Button>
    <Input type="number" placeholder="choose how many seconds of data segments to use" min={1} max={9} step={1} bind:value={secondsOfSegment}/>
  </section>
{/if}

{#if videoOrAudio === true}
<section>
	<h2>Video Board</h2>
	<video controls id="own"><track kind="captions"/></video>
  {#if !working}
    <button on:click={startSending}>Start</button>
  {/if}
  {#if working && !plays}
    <button on:click={resumeSending}>Resume</button>
  {/if}
  {#if working && plays}
    <button on:click={pauseSending}>Pause</button>
  {/if}
  {#if working}
    <button on:click={stopSending}>Stop</button>
  {/if}
</section>
{/if}

{#if videoOrAudio === false}
<section>
  <h2>Audio Board</h2>
  <audio controls id="own"></audio>
  {#if !working}
    <button on:click={startSending}>Start</button>
  {/if}
  {#if working && !plays}
    <button on:click={resumeSending}>Resume</button>
  {/if}
  {#if working && plays}
    <button on:click={pauseSending}>Pause</button>
  {/if}
  {#if working}
    <button on:click={stopSending}>Stop</button>
  {/if}
</section>
{/if}

<section id="test"></section>

<style>
	section{
		display: flex;
		flex-flow: column;
		width: 300px;
	}
</style>