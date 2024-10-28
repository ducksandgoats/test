import dexieFunc from 'dexie-relay'
import gunFunc from 'gun-relay'

const base = dexieFunc({debug: true, version: 1, url: '198.46.188.206:10509', hash: '7e6520e2fe505702ec644226ccb0a8bc467c5a2c', name: 'test', schema: {test: 'id, stamp, edit, text'}})
const gun = gunFunc({url: '107.173.15.203:10509', hash: '7e6520e2fe505702ec644226ccb0a8bc467c5a2c', debug: true})
const msg = (async () => {return (await fetch('msg://test')).body})()
const pubsub = (async () => {return (await fetch('pubsub://test')).body})()
const topic = (async () => {return (await fetch('topic://test')).body})()

export {base, gun, msg, pubsub, topic}