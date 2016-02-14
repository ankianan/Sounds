import {
    createNode
}
from "./nodes.js"




/**
 * [createIntroducerNode Create introducer with contact same as groupId]
 * @param  {[type]} groupId [description]
 * @return {[type]}         [description]
 */
export function createIntroducerNode(groupId) {
    return createNode({
        "name": "introducer",
        "contact": groupId
    });
}
