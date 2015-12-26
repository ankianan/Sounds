import {
    getCurrentPosition
}
from "./geoLocationManager.js";
import {
    peerConfigOptions, superUserDetails
}
from "../config.js";
import {
    renderResponse
}
from './requesManager.js';
import {
    onCallByBnode,    
}
from "./listener.js"

import{
    onConnectingBnode
}
from "./broadcaster.js"




function connectToSuperUser(peer, metadata) {
    var conn = peer.connect(superUserDetails.name, {
        "metadata": metadata
    });

    conn.on('data', function(data) {
        renderResponse(data, peer, metadata);
        conn.close();
    });

}


export function createUser(metadata) {
    var peer, conn;

    peer = new Peer(peerConfigOptions);

    if (metadata.type == "broadcaster") {
        onConnectingBnode(peer, metadata);        
    } else {
        onCallByBnode(peer);
    }

    getCurrentPosition(function(coords) {
        metadata.coords = coords;
        connectToSuperUser(peer, metadata);
    });

    return peer;

}
