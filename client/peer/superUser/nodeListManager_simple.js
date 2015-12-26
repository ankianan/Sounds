//This will be indexedDB implementation



//nodes sorted based on their distance from 0,0,0
var bnodeList = [

    /*{
        __proto__ : {
            coods: {
                x: Number,
                y: Number,
                z: Number
            }
        },        
        peer: Number
        connection: Object
    }*/

];


//Orignal formular is root of sum of square of differences
function distance(coords1, coords2) {
    var sum = 0;
    sum += coords1.x - coords2.x;
    sum += coords1.y - coords2.y;
    sum += coords1.z - coords2.z;
    return sum;
}

function createNewBnode(conn) {
    var newNode = Object.create(conn.metadata);
    newNode.id = conn.peer;
    newNode.connection = {};
    return newNode;
}

export function getNearbyBnodeIds(lMetadata) {
    return bnodeList.map(function(bnode) {
            return {
                id: bnode.id,
                distance: distance(bnode.coords, lMetadata.coords)
            };
        })
        .sort(function(a, b) {
            return a.distance - b.distance;
        });
}

//Add node to sorted bnodeList
export function addToBnodeList(conn) {
    var bnode = createNewBnode(conn);
    bnodeList.push(bnode);

}
