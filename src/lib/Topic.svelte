<script>
    import {Row, Col, Form, Input, Button} from '@sveltestrap/sveltestrap'

    let arr = []
    let text = ''

    async function func(){
        const test = await fetch('topic://test')
        for await (const message of test.body){
            console.log(message)
            arr.push(message)
            arr = arr
        }
    }

    func().then(console.log).catch(console.error)

    async function makePost(e){
        e.preventDefault()
        if(text){
            console.log(await (await fetch('topic://test', {method: 'POST', body: text})).text())
            arr.push(text)
            text = ''
            arr = arr
        }
    }
</script>

<Row>
    <Col>
        <Row>
            <Col>
                <Form>
                    <Input placeholder="Enter a value" bind:value={text}/>
                    <Button type="submit" on:click={makePost}>Submit</Button>
                </Form>
            </Col>
        </Row>
        {#if arr.length}
        {#each arr as post}
            <Row>
                <Col>
                    <p>{post}</p>
                </Col>
            </Row>
        {/each}
        {/if}
    </Col>
</Row>