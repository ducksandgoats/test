<script>
    import {Row, Col, Form, Input, Button} from '@sveltestrap/sveltestrap'
    import {base} from '../dir/init.js'

    let arr = []
    base.db.test.where('text').notEqual('').toArray().then((data) => {
        console.log(data)
        arr = data.map((e) => {return e.text})
    }).catch((data) => {console.error(data)})
    // console.log(arr)
    // arr = arr.map((e) => {return e.text})
    let text = ''
    async function func(e){
        e.preventDefault()
        if(text){
            const testing = await base.crud.add('test', {text}, true)
            arr.push((await base.db.test.get(testing)).text)
            arr = arr
            text = ''
        }
    }
</script>

<Row>
    <Col>
        <Row>
            <Col>
                <Form>
                    <Input placeholder="Enter a value" bind:value={text}/>
                    <Button type="submit" on:click={func}>Submit</Button>
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