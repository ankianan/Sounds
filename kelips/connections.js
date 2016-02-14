import {
    init_respondWith
}
from "queryBy.js"
import {
    init_recieveMessage
}
from "gossip.js"

var baseQueryUrl = "/query"


export var peerMap = {
    //nodeId : peerObject   
};

var promiseMap = {

};


export function getOpenConnectionTo(otherPeerId, peer) {
    if (otherPeerId in peer.connections) {
        return {
            conn: peer.connections[otherPeerId],
        }

    } else {
        var promise = new Promise();
        var conn = peer.connect('another-peers-id');
        conn.on('open', function() {
            promise.resolve(conn);
        });
        return {
            promise: promise;
        }
    }
}




export function createPeer(nodeId) {
    var peer = peerMap[nodeId] = new Peer(nodeId, {
        key: 'myapikey'
    });
    init_respondWith(peer);
    init_recieveMessage(peer);
}
