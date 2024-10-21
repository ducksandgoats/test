<script>
    import {Row, Col, Form, Input, Button} from '@sveltestrap/sveltestrap'
    import {gun} from '../dir/init.js'

    let arr = []
    let text = ''
    gun.get('test').once((data) => {
        delete data['_']
        arr = Object.values(data)
    })

    function func(e){
        e.preventDefault()
        if(text){
            gun.get('test').put({[crypto.randomUUID()]: text}).once((datas) => {
            delete datas['_']
            Object.values(datas).forEach((e) => {
                arr.push(e)
            })
            arr = arr
            text = ''
        })
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