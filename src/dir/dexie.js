import {Client} from 'relay-to-relay'
import {Dexie} from 'dexie'

export default function(opts){
    
    function id(){return crypto.randomUUID()}
    
    const client = new Client(opts.url, opts.hash, opts.rtor)
    
    const db = new Dexie(opts.name, {})
    db.version(opts.version).stores(opts.schema)
    
    function creating(table){
        return function created(key, value, transaction){
            value.stamp = Date.now()
            client.onSend(JSON.stringify({name: table, key, value, transaction, status: 'creating'}))
        }
    }
    
    function updating(table){
        return function updated(mod, key, value, transaction){
            value.edit = Date.now()
            client.onSend(JSON.stringify({name: table, mod, key, value, transaction, status: 'updating'}))
        }
    }
    
    function deleting(table){
        return function deleted(key, value, transaction){
            client.onSend(JSON.stringify({name: table, key, value, transaction, status: 'deleting'}))
        }
    }
    
    db.tables.forEach(async (table) => {
        table.hook('creating', creating(table.name))
        table.hook('updating', updating(table.name))
        table.hook('deleting', deleting(table.name))
        const useStamp = await table.orderBy('stamp').last()
        const useEdit = await table.orderBy('edit').last()
        client.onSend(JSON.stringify({name: table.name, stamp: useStamp.stamp, edit: useEdit.edit, session: true}))
    })
    
    const connect = (chan) => {console.log('connected: ' + chan.id)}
    const err = (e) => {console.error(e.id, e)}
    const disconnect = (chan) => {console.log('disconnected: ' + chan.id)}
    client.on('connect', connect)
    client.on('error', err)
    client.on('disconnect', disconnect)
    const message = async (data, iden) => {
        try {
            const datas = JSON.parse(data)
            if(db[datas.name]){
                if(datas.status){
                    if(datas.status === 'creating'){
                        await db[datas.name].add(datas.value)
                    } else if(datas.status === 'updating'){
                        await db[datas.name].put({...datas.value, ...datas.mod})
                    } else if(datas.status === 'deleting'){
                        await db[datas.name].delete(datas.key)
                    } else {
                        return
                    }
                    client.onMesh(data, iden)
                } else {
                    if(datas.session){
                        const stamp = await db[datas.name].where('stamp').above(datas.stamp).toArray()
                        const edit = await db[datas.name].where('edit').above(datas.edit).toArray()
                        datas.stamp = stamp
                        datas.edit = edit
                        datas.session = false
                        client.onSend(JSON.stringify(datas), iden)
                    } else {
                        datas.stamp.forEach((rec) => {
                            db[datas.name].put(rec)
                        })
                        datas.edit.forEach((rec) => {
                            db[datas.name].put(rec)
                        })
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

    return {id, db, client, quit}
}