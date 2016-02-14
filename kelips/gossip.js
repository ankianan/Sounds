import {
    getNode
}
from "./node.js"
import {
    peerMap,
    getOpenConnectionTo
}
from "./connections.js"

export messages = {
    "JOIN": 1
}

var baseGossipUrl = "/gossip";
var gossipTargetsCount = 5;

function getRandomBoolean() {
    var randomInRange2 = parseInt(Math.random() * 2);
    return randomInRange2 ? true : false;
}

function getTargetsNodeIds(nodeId, groupId) {
    var node = getNode(nodeId);
    var view = node.softState.AFGroupView;
    var targetNodeIds = [];
    for (nodeId in view) {
        if (targetNodeIds.length > gossipTargetsCount) {
            break;
        }
        var randomBool = getRandomBoolean();
        if (randomBool) {
            targetNodeIds.push(nodeId)
        }
    }
    return targetNodeIds;
}

function sendMessage(message, toNodeId, byNodeId) {
    var peer = peerMap[byNodeId];
    var SFOBJ_openConn = getOpenConnectionTo(toNodeId, peer);

    if ("promise" in SFOBJ_openConn) {
        SFOBJ_openConn.promise.then(function(openedConn) {
            conn.send(baseGossipUrl, {
                message: message
            });
        })
    } else if ("conn" in SFOBJ_openConn) {
        SFOBJ_openConn.conn.send(baseGossipUrl, {
            message: message
        });
    }
}

export function init_recieveMessage(peer) {
    peer.on('connection', function(conn) {
        conn.on(baseGossipUrl, function(data) {
            if (data.message == message["JOIN"]) {
                //Update soft node state 
            }
        });
    });
}

export function spreadMessage(byNodeId, groupId, message) {
    var targetNodeIds = getTargetsNodeIds(nodeId, groupId);
    for (key in targetNodeIds) {
        var toNodeId = targetNodeIds[key];
        //Peer communicate messages
        sendMessage(message, toNodeId, byNodeId);

    }

}
