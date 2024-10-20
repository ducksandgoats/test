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
        const useStamp = await table.toCollection().last()
        const useEdit = await table.toCollection().last()
        if(useStamp?.stamp || useEdit?.edit){
            client.onSend(JSON.stringify({name: table.name, stamp: useStamp?.stamp, edit: useEdit?.edit, session: true}))
        }
    })

    async function add(name, data){
        if(db[name]){
            if(!data.stamp){
                data.stamp = Date.now()
            }
            if(!data.user){
                data.user = user
            }
            await db[name].add(data)
            client.onSend(JSON.stringify({name, data, user, status: 'add'}))
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

    async function edit(name, prop, data){
        if(db[name]){
            const test = db[name].get(prop)
            if(test && test.user && test.user === user){
                data.edit = Date.now()
                await db[name].update(prop, data)
                client.onSend(JSON.stringify({name, prop, data, user, status: 'sub'}))
            }
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
                    } else if(datas.status === 'edit'){
                        await db[datas.name].update(datas.prop, datas.data)
                    } else if(datas.status === 'sub'){
                        await db[datas.name].delete(datas.prop)
                    } else {
                        return
                    }
                    client.onMesh(data, iden)
                } else {
                    if(datas.session){
                        const stamp = datas.stamp ? await db[datas.name].where('stamp').above(datas.stamp).toArray() : null
                        const edit = datas.edit ? await db[datas.name].where('edit').above(datas.edit).toArray() : null
                        datas.stamp = stamp
                        datas.edit = edit
                        datas.session = false
                        client.onSend(JSON.stringify(datas), iden)
                    } else {
                        if(datas.stamp){
                            for(const check of datas.stamp){
                                try {
                                    if(check.user && check.user === user){
                                        continue
                                    } else {
                                        await db[datas.name].put(check)
                                    }
                                } catch {
                                    
                                }
                            }
                        }
                        if(datas.edit){
                            for(const checking of datas.edit){
                                try {
                                    if(checking.user && checking.user === user){
                                        continue
                                    } else {
                                        await db[datas.name].put(checking)
                                    }
                                } catch {
                                    
                                }
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
        client.off('connect', connect)
        client.off('error', err)
        client.off('message', message)
        client.off('disconnect', disconnect)
        client.end()
        db.close()
    }

    return {id, db, client, quit, crud: {add, edit, sub}}
}