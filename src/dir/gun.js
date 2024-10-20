import Gun from 'gun/gun'
import 'gun/sea'
import 'gun/lib/radix'
import 'gun/lib/radisk'
import 'gun/lib/store'
import 'gun/lib/rindexed'
import {Client} from 'relay-to-relay'

export default function(opts){
    const debug = opts.debug
    if(!opts.gun){
        opts.gun = {}
    }
    let urlProxy

    const channel = new Client(opts.url, opts.hash, opts.rtor)

    const connect = (chan) => {console.log('connected: ' + chan)}
    const err = (e, chan) => {console.error(e, chan)}
    const disconnect = (chan) => {console.log('disconnected: ' + chan)}
    channel.on('connect', connect)
    channel.on('error', err)
    channel.on('disconnect', disconnect)

    // WebSocketProxy definition

    const WebSocketProxy = function (url) {
        const websocketproxy = {};

        websocketproxy.url = url || 'ws:proxy';
        urlProxy = url || 'ws:proxy';
        websocketproxy.CONNECTING = 0;
        websocketproxy.OPEN = 1;
        websocketproxy.CLOSING = 2;
        websocketproxy.CLOSED = 3;
        websocketproxy.readyState = 1;
        websocketproxy.bufferedAmount = 0;
        websocketproxy.onopen = function () { };
        websocketproxy.onerror = function () { };
        websocketproxy.onclose = function () { };
        websocketproxy.extensions = '';
        websocketproxy.protocol = '';
        websocketproxy.close = { code: '4', reason: 'Closed' };
        websocketproxy.onmessage = function () { }; //overwritten by gun
        websocketproxy.binaryType = 'blob';
        websocketproxy.send = sendMessage;

        return websocketproxy
    }

    let gunMessage

    function attachGun(gun){
        if(urlProxy){
            if(debug){
                console.log('proxy', urlProxy)
            }
            gunMessage = gun._.opt.peers[urlProxy].wire.onmessage
            channel.on('message', message)
            gun.quit = shutdown(gun)
            gun.status = true
            console.log('gundb is attached')
        } else {
            // attachGun(gun)
            setTimeout(() => {attachGun(gun)}, 5000)
        }
    }

    function sendMessage(data){
        if(debug){
            console.log('Sending Data: ', typeof(data), data)
        }
        channel.onSend(data)
    }

    function message(data, id){
        if(debug){
            console.log('Received Message: ', typeof(data), data)
        }
        gunMessage(data)
        channel.onMesh(data, id)
    }

    function shutdown(gun){
        return function(){
            channel.off('connect', connect)
            channel.off('message', message)
            channel.off('error', err)
            channel.off('disconnect', disconnect)
            var mesh = gun.back('opt.mesh'); // DAM
            var peers = gun.back('opt.peers');
            Object.keys(peers).forEach((id) => {mesh.bye(id)});
            gun.status = false
            channel.end()
        }
    }

    const gun = Gun({ ...opts.gun, peers: ["proxy:websocket"], WebSocket: WebSocketProxy })
    attachGun(gun)
    return gun
}