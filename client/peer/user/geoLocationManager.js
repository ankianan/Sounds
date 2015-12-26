import {
    setListenerOrientation
}
from "./audioStreamManager.js";
import {
    notifyConnectedPeers
}
from "./broadcaster.js"


function latLongToECEF(coords) {
    var cosLat = Math.cos(coords.latitude * Math.PI / 180.0);
    var sinLat = Math.sin(coords.latitude * Math.PI / 180.0);
    var cosLon = Math.cos(coords.longitude * Math.PI / 180.0);
    var sinLon = Math.sin(coords.longitude * Math.PI / 180.0);
    var rad = 6378137.0;
    var f = 1.0 / 298.257224;
    var C = 1.0 / Math.sqrt(cosLat * cosLat + (1 - f) * (1 - f) * sinLat * sinLat);
    var S = (1.0 - f) * (1.0 - f) * C;
    var h = 0.0;
    var x = (rad * C + h) * cosLat * cosLon;
    var y = (rad * C + h) * cosLat * sinLon;
    var z = (rad * S + h) * sinLat;

    return {
        x: parseInt(x / 1000),
        y: parseInt(y / 1000),
        z: parseInt(z / 1000)
    }
}



export function getCurrentPosition(callback) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var ECEFCoords = latLongToECEF(position.coords)
        callback(ECEFCoords);
    });
}

export function watchPosition(nodeType) {
    if (nodeType == "listener") {
        navigator.geolocation.watchPosition(function(position) {
            //Notify server
            setListenerOrientation(latLongToECEF(position.coords));
        });
    } else if (nodeType == "broadcaster") {
        {
            navigator.geolocation.watchPosition(function(position) {
                //Notify server
                notifyConnectedPeers(latLongToECEF(position.coords));
            });
        }

    }
}
