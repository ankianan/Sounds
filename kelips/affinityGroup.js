import {
    createIntroducerNode
}
from "./introducer.js"

//Number of affinity group
var k = 2; // 0,1



/**
 * [getAffinityGroup Return affinity group by modulus]
 * @param  {[int]} hash [unique hash Id of peer]
 * @return {[init]}      [Affinity group]
 */
export function getAffinityGroup(hash) {
    return hash % k;
}

/**
 * [createAffinityGroup Create as many introducer nodes as many the number of affinity groups]
 * @return {[type]} [description]
 */
export function createAffinityGroup() {
    for (var groupId = 0; groupId < k; groupId++) {
        createIntroducerNode(groupId);
    }
}
