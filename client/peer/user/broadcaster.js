import {
    REQUEST
}
from "../requestType.js";
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var connMap = {};
var callMap = {};

function notifyConnectedPeers(coords) {
    for (key in connMap) {
        var conn = connMap[key];
        conn.send({
            type: REQUEST.TYPE.UPDATE.POSCHANGE,
            result: coords
        });
    }
}

function callLnode(lnodeId, peer) {
    getUserMedia.call(window.navigator, {
            //video: true,
            audio: true
        }, function(stream) {
            callMap[lnodeId] = peer.call(lnodeId, stream);
        },
        function(err) {
            console.log('Failed to get local stream', err);
        });
}

function closeCall(lnodeId) {
    callMap[lnodeId].close();
}

export function onConnectingBnode(peer, metadata) {
    peer.on('connection', function(conn) {
        console.log("bnode", metadata.name, "connected lnode", conn.metadata.name);
        conn.on('open', function() {
            callLnode(conn.peer, peer);
            connMap[conn.peer] = conn;
        });
        conn.on('data', function(data) {
            if (data.type == REQUEST.TYPE.DELETE.CLOSECONN) {
                var lnodeId = data.result;
                closeCall(lnodeId)
                conn.close();
            }
        });

    });
}
