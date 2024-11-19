<script>
	// import { onMount } from 'svelte'
  import {Button, Input} from '@sveltestrap/sveltestrap'
  import {media} from '../dir/init.js'
  // const id = crypto.randomUUID()

  let mediaRecorder = null
  let videoOrAudio = null
  let secondsOfSegment = 5
  let segments = 0
  let working = false
  let plays = false
  let mainRoom = 'testing'

  media.on('media', (data) => {
    if(data.state){
      if(data.state === 'stop'){
        const el = document.getElementById(data.user)
        if(el){
          el.pause()
          el.remove()
        }
      } else {
        const makeEl = data.kind ? document.createElement('video') : document.createElement('audio')
        makeEl.id = data.user
        document.getElementById('test').append(makeEl)
        if(data.state === 'play'){
          makeEl.play()
        } else if(data.state === 'pause'){
          makeEl.pause()
        } else if(data.state === 'start'){
          makeEl.play()
          // return
        } else {
          return
        }
      }
    }
    if(data.segment){
      const el = document.getElementById(data.user)
      if(el){
        el.src = window.URL.createObjectURL(new Blob( [data.data], {'type': data.mime}));
      } else {
        const makeEl = data.kind ? document.createElement('video') : document.createElement('audio')
        makeEl.id = data.user
        document.getElementById('test').append(makeEl)
        makeEl.src = window.URL.createObjectURL(new Blob( [data.data], {'type': data.mime}))
      }
    }
  })

  media.on('expire', (data) => {
    const el = document.getElementById(data.user)
    if(el){
      el.remove()
    }
  })

  async function testFunc(use){
    const obj = use ? { audio: true, video: true } : { audio: true, video: false }
    const vid = obj.video && obj.audio ? true : false
    mediaRecorder = null;
		const stream = await navigator.mediaDevices.getUserMedia(obj);
		
		mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('error', (ev) => {
      console.error(ev.error)
    })
    mediaRecorder.addEventListener('start', () => {
      media.start(mainRoom, vid, mediaRecorder.mimeType)
    })
    mediaRecorder.addEventListener('resume', () => {
      media.play(mainRoom, vid, mediaRecorder.mimeType)
    })
    mediaRecorder.addEventListener('pause', () => {
      media.pause(mainRoom, vid, mediaRecorder.mimeType)
    })
    mediaRecorder.addEventListener('stop', () => {
      media.stop(mainRoom, vid, mediaRecorder.mimeType)
    })
		mediaRecorder.addEventListener('dataavailable', async (ev) => {
			document.getElementById('own').src = window.URL.createObjectURL(ev.data);
      segments = segments + 1
      await media.data(mainRoom, vid, mediaRecorder.mimeType, segments, await ev.data.text())
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
  <Input bind:value={mainRoom}></Input>
  <Button on:click={(e) => {console.log(e);media.add(mainRoom)}}>Add</Button><Button on:click={(e) => {console.log(e);media.sub(mainRoom)}}>Sub</Button>
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