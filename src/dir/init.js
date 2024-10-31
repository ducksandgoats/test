import Base from 'dexie-relay'
import gunFunc from 'gun-relay'

const base = new Base({debug: true, version: 1, url: '198.46.188.206:10509', hash: '7e6520e2fe505702ec644226ccb0a8bc467c5a2c', name: 'test', schema: {test: 'id, stamp, edit, text'}, sync: true})
const gun = new gunFunc({url: '107.173.15.203:10509', hash: '7e6520e2fe505702ec644226ccb0a8bc467c5a2c', debug: true})

export {base, gun}