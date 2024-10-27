import {Client} from 'relay-to-relay'
import {Dexie} from 'dexie'

export default function(opts){

    const debug = opts.debug

    const force = opts.force === false ? opts.force : true

    const user = localStorage.getItem('user') || (() => {const test = crypto.randomUUID();localStorage.setItem('user', test);return test;})()
    
    function id(){return crypto.randomUUID()}
    
    const client = new Client(opts.url, opts.hash, opts.rtor)

    for(const records in opts.schema){
        const record = opts.schema[records].split(',')
        if(!record.includes('stamp')){
            record.push('stamp')
        }
        if(!record.includes('edit')){
            record.push('edit')
        }
        if(record.includes('iden')){
            record.splice(record.indexOf('iden'), 1)
            record.unshift('iden')
        } else {
            record.unshift('iden')
        }
        opts.schema[records] = record.join(',')
    }
    
    const db = new Dexie(opts.name, {})
    if(debug){
        console.log('name', db.name)
    }
    db.version(opts.version).stores(opts.schema)

    db.tables.forEach(async (table) => {
        let useStamp
        let useEdit
        try {
            useStamp = await table.where('stamp').notEqual(0).last()
        } catch {
            useStamp = {}
        }
        try {
            useEdit = await table.where('edit').notEqual(0).last()
        } catch {
            useEdit = {}
        }
        client.onSend(JSON.stringify({name: table.name, stamp: useStamp?.stamp, edit: useEdit?.edit, session: true}))
    })

    const updates = new Map()

    const routine = setInterval(() => {
        for(const [prop, update] of updates.entries()){
            if((Date.now() - update) > 900000){
                updates.delete(prop)
            }
        }
    }, 180000)

    async function add(name, data, ret = null){
        if(db[name]){
            data.stamp = data.stamp || Date.now()
            data.user = data.user || user
            data.iden = data.iden || crypto.randomUUID()
            data.edit = 0
            const test = await db[name].add(data)
            client.onSend(JSON.stringify({name, data, user: data.user, stamp: data.stamp, iden: test, status: 'add'}))
            if(ret){
                return test
            }
        }
    }

    async function edit(name, prop, data, ret = null){
        if(db[name]){
            const test = db[name].get(prop)
            if(test && test.user === user){
                data.edit = Date.now()
                const num = await db[name].update(prop, data)
                client.onSend(JSON.stringify({name, prop, data, iden: test.iden, user: test.user, edit: data.edit, num, status: 'edit'}))
                if(ret){
                    return num
                }
            }
        }
    }

    async function sub(name, prop, ret = null){
        if(db[name]){
            const test = await db[name].get(prop)
            if(test){
                if(force){
                    await db[name].delete(prop)
                    if(test.user === user){
                        client.onSend(JSON.stringify({name, prop, user: test.user, status: 'sub'}))
                        if(ret){
                            return prop
                        }
                    }
                } else {
                    if(test.user === user){
                        await db[name].delete(prop)
                        client.onSend(JSON.stringify({name, prop, user: test.user, status: 'sub'}))
                        if(ret){
                            return prop
                        }
                    }
                }
            }
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
            if(datas.user === user){
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
                                updates.set(datas.iden, datas.edit)
                                await db[datas.name].update(datas.prop, datas.data)
                                client.onMesh(data, iden)
                            }
                        } else {
                            updates.set(datas.iden, datas.edit)
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
                        let stamp
                        let edit
                        try {
                            stamp = datas.stamp ? await db[datas.name].where('stamp').above(datas.stamp).toArray() : await db[datas.name].where('stamp').toArray()
                        } catch {
                            stamp = []
                        }
                        while(stamp.length){
                            datas.session = false
                            datas.edit = null
                            datas.stamp = stamp.splice(stamp.length - 50, 50)
                            client.onSend(JSON.stringify(datas), iden)
                        }
                        try {
                            edit = datas.edit ? await db[datas.name].where('edit').above(datas.edit).toArray() : await db[datas.name].where('edit').toArray()
                        } catch {
                            edit = []
                        }
                        while(edit.length){
                            datas.session = false
                            datas.stamp = null
                            datas.edit = edit.splice(edit.length - 50, 50)
                            client.onSend(JSON.stringify(datas), iden)
                        }
                    } else {
                        if(datas.stamp){
                            let hasStamp
                            try {
                                hasStamp = await db[datas.name].where('stamp').notEqual(0).last()
                            } catch {
                                hasStamp = {}
                            }
                            const stamps = hasStamp?.stamp ? datas.stamp.filter((e) => {return e.stamp > hasStamp.stamp}) : datas.stamp
                            for(const stamp of stamps){
                                try {
                                    if(stamp.user === user){
                                        continue
                                    } else {
                                        await db[datas.name].put(stamp)
                                    }
                                } catch {
                                    continue
                                }
                            }
                        }
                        if(datas.edit){
                            let hasEdit
                            try {
                                hasEdit = await db[datas.name].where('edit').notEqual(0).last()
                            } catch {
                                hasEdit = {}
                            }
                            const edits = hasEdit?.edit ? datas.edit.filter((e) => {return e.edit > hasEdit.edit}) : datas.edit
                            for(const edit of edits){
                                try {
                                    if(edit.user === user){
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