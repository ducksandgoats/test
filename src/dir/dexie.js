import {Client} from 'relay-to-relay'
import {Dexie} from 'dexie'

export default function(opts){

    const debug = opts.debug

    function makeUser(){
        if(opts.user){
            let test = localStorage.getItem('user')
            if(test){
                return test
            } else {
                test = crypto.randomUUID()
                localStorage.setItem('user', test)
                return test
            }
        } else {
            let test = sessionStorage.getItem('user')
            if(test){
                return test
            } else {
                test = crypto.randomUUID()
                sessionStorage.setItem('user', test)
                return test
            }
        }
    }

    const user = makeUser()
    
    function id(){return crypto.randomUUID()}
    
    const client = new Client(opts.url, opts.hash, opts.rtor)
    
    const db = new Dexie(opts.name, {})
    if(debug){
        console.log('name', db.name)
    }
    db.version(opts.version).stores(opts.schema)

    db.tables.forEach(async (table) => {
        const useStamp = await table.where('stamp').below(Date.now()).last()
        const useEdit = await table.where('edit').below(Date.now()).last()
        if(useStamp?.stamp || useEdit?.edit){
            client.onSend(JSON.stringify({name: table.name, stamp: useStamp?.stamp, edit: useEdit?.edit, session: true}))
        }
    })

    const updates = new Map()

    const routine = setInterval(() => {
        for(const [prop, update] of updates.entries()){
            if((Date.now() - update) > 900000){
                updates.delete(prop)
            }
        }
    }, 180000)

    async function add(name, data){
        if(db[name]){
            if(!data.stamp){
                data.stamp = Date.now()
            }
            if(!data.user){
                data.user = user
            }
            if(!data.id){
                data.id = crypto.randomUUID()
            }
            await db[name].add(data)
            client.onSend(JSON.stringify({name, data, user, stamp: data.stamp, status: 'add'}))
        }
    }

    async function edit(name, prop, data){
        if(db[name]){
            const test = db[name].get(prop)
            if(test && test.user && test.user === user){
                data.edit = Date.now()
                await db[name].update(prop, data)
                client.onSend(JSON.stringify({name, prop, data, id: test.id, user, edit: data.edit, status: 'edit'}))
            }
        }
    }

    async function sub(name, prop){
        if(db[name]){
            const test = db[name].get(prop)
            if(test && test.user && test.user === user){
                await db[name].delete(prop)
                client.onSend(JSON.stringify({name, prop, user, status: 'sub'}))
            }
        }
    }

    async function force(name, prop){
        if(db[name]){
            await db[name].delete(prop)
        }
    }

    async function clear(name){
        if(db[name]){
            await db[name].clear()
        }
    }
    
    const connect = (chan) => {console.log('connected: ' + chan)}
    const err = (e, chan) => {console.error(e, chan)}
    const disconnect = (chan) => {console.log('disconnected: ' + chan)}
    client.on('connect', connect)
    client.on('error', err)
    client.on('disconnect', disconnect)
    const message = async (data, iden) => {
        try {
            if(debug){
                console.log('Received Message: ', typeof(data), data)
            }
            const datas = JSON.parse(data)
            if(datas.user && datas.user === user){
                return
            }
            if(db[datas.name]){
                if(datas.status){
                    if(datas.status === 'add'){
                        await db[datas.name].add(datas.data)
                        client.onMesh(data, iden)
                    } else if(datas.status === 'edit'){
                        if(updates.has(datas.id)){
                            const test = updates.get(datas.id)
                            if(datas.edit > test){
                                updates.set(datas.id, datas.edit)
                                await db[datas.name].update(datas.prop, datas.data)
                                client.onMesh(data, iden)
                            }
                        } else {
                            updates.set(datas.id, datas.edit)
                            await db[datas.name].update(datas.prop, datas.data)
                            client.onMesh(data, iden)
                        }
                    } else if(datas.status === 'sub'){
                        await db[datas.name].delete(datas.prop)
                        client.onMesh(data, iden)
                    } else {
                        return
                    }
                } else {
                    if(datas.session){
                        const stamp = datas.stamp ? await db[datas.name].where('stamp').above(datas.stamp).toArray() : await db[datas.name].where('stamp').toArray()
                        const edit = datas.edit ? await db[datas.name].where('edit').above(datas.edit).toArray() : await db[datas.name].where('edit').toArray()
                        datas.stamp = stamp
                        datas.edit = edit
                        datas.session = false
                        client.onSend(JSON.stringify(datas), iden)
                    } else {
                        const hasStamp = await db[datas.name].toCollection().last()
                        const hasEdit = await db[datas.name].toCollection().last()
                        const useStamp = hasStamp || {}
                        const useEdit = hasEdit || {}
                        const stamps = useStamp.stamp ? datas.stamp.filter((e) => {return e.stamp > useStamp.stamp}) : datas.stamp
                        const edits = useEdit.edit ? datas.edit.filter((e) => {return e.edit > useEdit.edit}) : datas.edit
                        for(const stamp of stamps){
                            try {
                                if(stamp.user && stamp.user === user){
                                    continue
                                } else {
                                    await db[datas.name].put(stamp)
                                }
                            } catch {
                                continue
                            }
                        }
                        for(const edit of edits){
                            try {
                                if(edit.user && edit.user === user){
                                    continue
                                } else {
                                    await db[datas.name].put(edit)
                                }
                            } catch {
                                continue
                            }
                        }
                    }
                }
            }
        } catch {
            return
        }
    }
    client.on('message', message)

    function quit(){
        clearInterval(routine)
        updates.clear()
        client.off('connect', connect)
        client.off('error', err)
        client.off('message', message)
        client.off('disconnect', disconnect)
        client.end()
        db.close()
    }

    return {id, db, client, quit, crud: {add, edit, sub, force, clear}}
}