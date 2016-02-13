import {
    getNode
}
from "./node.js"

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

function spreadMessage(nodeId, groupId, message) {
    var targetNodeIds = getTargetsNodeIds(nodeId, groupId);
    for(key in targetNodeIds){
    	var nodeId = targetNodeIds[key];
    	//Peer communicate messages
    }

}
