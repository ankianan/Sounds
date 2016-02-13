import {
    getAffinityGroup
}
from "./affinityGroup.js"

import {
    initNodeSoftState
}
from "./nodeSoftState.js"

var nodeMap = {
    //Someday might a same machine making multipel nodes
};

constructor.prototype = {
    groupId: Number,
    softState: Object
}

function constructor(metaData) {
    this.nodeId = metaData.contact;
    this.groupId = getAffinityGroup(this.nodeId);
    this.softState = initNodeSoftState(this.nodeId, this.groupId)

    nodeMap[this.nodeId] = this;
}

export getNode(nodeId) {
    return nodeMap[nodeId];
}

export function createNode(metaData) {
    return (new constructor(metaData));
}
