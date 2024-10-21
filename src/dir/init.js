import dexieFunc from './dexie.js'
import gunFunc from './gun.js'

const base = dexieFunc({debug: true, version: 1, url: 'ws://198.46.188.206:10509/signal', hash: '7e6520e2fe505702ec644226ccb0a8bc467c5a2c', name: 'test', schema: {test: 'id, connection, try, stamp, edit, text'}})
const gun = gunFunc({url: 'ws://107.173.15.203:10509/signal', hash: '7e6520e2fe505702ec644226ccb0a8bc467c5a2c', debug: true})
const msg = (async () => {return (await fetch('msg://test')).body})()
const pubsub = (async () => {return (await fetch('pubsub://test')).body})()
const topic = (async () => {return (await fetch('topic://test')).body})()

export {base, gun, msg, pubsub, topic}