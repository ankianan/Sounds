import{
	connectToBnode
}
from "./listener.js"
import {
    REQUEST
}
from "../requestType.js";

export function renderResponse(data, peer, metadata) {
	var nearbyUserId;
    if (data.type == REQUEST.TYPE.GET.NEARUSER) {
    	nearbyUserId = data.result[0].id;
    	connectToBnode(nearbyUserId, peer, metadata);
    	
        /*data.result.map(function(nearbyUserId) {
            connectToBnode(nearbyUserId, peer, metadata)
        })*/
    }
}

export function makeRequest(type, peer) {
    peer.connection[superUserDetails.name][0].send({
        type: type
    });
}
