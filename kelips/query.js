import {
    peerMap,
    getOpenConnectionTo
}
from "./connections.js"


export var queryNames = {
    "getSoftNodeState": 1
}

export function queryBy(queryName, toNodeId, byNodeId) {
    var peer = peerMap[byNodeId];
    var SFOBJ_openConn = getOpenConnectionTo(toNodeId, peer);

    if ("promise" in SFOBJ_openConn) {
        SFOBJ_openConn.promise.then(function(openedConn) {
            conn.send(baseQueryUrl, {
                query: queryName
            });
        })
    } else if ("conn" in SFOBJ_openConn) {
        SFOBJ_openConn.conn.send(baseQueryUrl, {
            query: queryName
        });
    }

    return (promiseMap[queryName] = new Promise());
}

export function init_respondWith(peer) {
    peer.on('connection', function(conn) {

        conn.on(baseQueryUrl, function(data) {
            if (data.query == queryName["getSoftNodeState"]) {
                conn.send(baseQueryUrl, {
                    response: getNodeSoftState(nodeId),
                    queryName: data.query,
                })
            }
            if (data.response) {
                promiseMap[data.response.queryName].resolve(data.response);
            }
        });
    });
}
