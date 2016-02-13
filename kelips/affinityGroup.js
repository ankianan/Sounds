import {
    createNode
}
from "./nodes.js"

//Number of affinity group
var k = 2; // 0,1

//Map of introducer nodes indexed by affinity group index
var introducerMap = {
    //groupId : nodeObject
};


/**
 * [getAffinityGroup Return affinity group by modulus]
 * @param  {[int]} hash [unique hash Id of peer]
 * @return {[init]}      [Affinity group]
 */
export function getAffinityGroup(hash) {
    return hash % k;
}

function createIntroducerNode(groupId) {
    return createNode({
        "name": "introducer",
        "contact": "0"
    });
}

export function getIntroducerNode(groupId) {
    var introducerNode = introducerMap[groupId];
    if (!introducerNode) {
        introducerNode = introducerMap[groupId] = createIntroducerNode(groupId);
    }
    return introducerNode;
}
