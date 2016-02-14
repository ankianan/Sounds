//SFOBJ = safeObejct It can conctain promise or actual object
import {
    getAffinityGroup
}
from "./affinityGroup.js"

import {
    getIntroducerNodeSoftState
}
from "./nodeSoftState.js"

import {
    createPeer
}
from "./connections.js"
import {
    messages,
    spreadMessage
}
from "./gossip.js"

var nodeMap = {
    //Someday might a same machine making multipel nodes
};

var connectionPool = {};


constructor.prototype = {
    groupId: Number,
    softState: Object
}

function setSoftState(softState) {
    this.softState = softState;
    //gossip your entery
    spreadMessage(this.nodeId, this.groupId, messages["JOIN"])
        //warm soft state
        //make connection
}

function constructor(metaData) {
    this.nodeId = metaData.contact;
    nodeMap[this.nodeId] = this;

    this.groupId = getAffinityGroup(this.nodeId);
    var SFOBJ = getIntroducerNodeSoftState(this.nodeId, this.groupId);
    if ("promise" in SFOBJ) {
        SFOBJ
            .then(function(softState) {
                setSoftState.call(this, softState);
            })
    } else if ("softState" in SFOBJ) {
        setSoftState.call(this, SFOBJ.softState);
    }

    createPeer(this.nodeId);
}

export getNode(nodeId) {
    return nodeMap[nodeId];
}

export function createNode(metaData) {
    return new constructor(metaData);
}
