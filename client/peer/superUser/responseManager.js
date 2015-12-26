import {
    REQUEST
}
from "../requestType.js";
import {
    getNearbyBnodeIds
}
from "./nodeListManager_simple.js";


export function makeResponse(type, conn) {
    var result = null;
    if (type == REQUEST.TYPE.GET.NEARUSER) {
        result = getNearbyBnodeIds(conn.metadata);
    } else if (type == REQUEST.TYPE.POST.REGISTER) {
        result = true;
    }

    console.log(result);

    conn.send({
        "type": type,
        "result": result
    });

}
