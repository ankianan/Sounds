import {
    REQUEST
}
from "../requestType.js";

import {
    peerConfigOptions, superUserDetails
}
from "../config.js";
import {
    criticalQueue
}
from "./criticalQueueManager.js";
import {
    addToBnodeList
}
from "./nodeListManager_simple.js";
import {
    makeResponse
}
from "./responseManager.js";



function listen(peer) {
    peer.on('connection', function(conn) {
        conn.on('open', function() {
            criticalQueue.push(function() {
                if (conn.metadata.type == "broadcaster") {
                    addToBnodeList(conn);
                    makeResponse(REQUEST.TYPE.POST.REGISTER, conn);
                } else {
                    makeResponse(REQUEST.TYPE.GET.NEARUSER, conn);
                }
            });

        });

    });
}


export function createSuperUser() {
    var peer;

    peer = new Peer(superUserDetails.name, peerConfigOptions);
    listen(peer);

    return peer;
}
