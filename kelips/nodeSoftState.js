import {
    queryNames,
    queryBy
}
from "./connection.js"

//Number of contacts per foreign affinity group
var c = 2;

//hearBeat timeout
var hearBeatTimeout = 1000; //ms


function getHeatBeatCount(fromNode, toNode) {
    var Promise = new Promise();
    //Succesfull Peer data transfer will resolve the promise
    setTimeout(function() {
        Promise.reject();
    }, hearBeatTimeout);
    return Promise;
}



function getViewOfNode(nodeId, newNodeId, AFGroupView) {

    var view = {
        roundTripTime: 0,
        heartBeatCount: 0
    };
    getHeartBeatCount(nodeId, newNodeId).then(function(data) {
        view.heartBeatCount = data.count;
    }, function() {
        delete AFGroupView[nodeId];
    });
    return view;
}

function updateViewOfNode(nodeId, newNodeId, AFGroupView) {
    var data = getViewOfNode(nodeId, newNodeId, AFGroupView)
    AFGroupView[nodeId] = data;
}



function updateNodeSoftState(nodeId, newNodeId, nodeSoftState) {
    updateViewOfNode(nodeSoftState.AFGroupView);
}


export function getNodeSoftState(node) {
    return node.softState;
}

export function getIntroducerNodeSoftState(nodeId, groupId) {

    if (nodeId == groupId) { //Is introducer

        var AFGroupView = {};
        AFGroupView[groupId] = {
            roundTripTime: 0,
            heartBeatCount: 100
        }

        return {
            softState: {
                AFGroupView: AFGroupView
                    /*{
                                nodeId: {
                                    roundTripTime: "integer",
                                    heartBeatCount: "integer"
                                }
                            }*/
                    ,
                contacts: {}
                /*
                           /*{AFGroupId: [{
                               nodeId: "integer",
                               roundTripTime: "integer",
                               heartBeatCount: "integer"
                           }]}
                       */
                ,
                fileTuples: []
                    /*[{
                                file: "string",
                                nodeId: "integer",
                                heartBeatCount: "integer"
                            }]*/

            }
        }

    } else {
        //Peer call to introducer node return promise
        var introducerId = groupId;
        return {
            promise: queryBy(queryNames["getNodeSoftState"], introducerId, nodeId);
        }
    }
}
