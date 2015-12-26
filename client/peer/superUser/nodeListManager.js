//This will be indexedDB implementation



//nodes sorted based on their distance from 0,0,0
var broadcasterList = [

    /*{
        __coods__: {
            x: Number,
            y: Number,
            z: Number
        }
        peer: Number
        connection: Object
    }*/

];


function getNearByBroadcasterIndexsArray(broadcasterList, bIndex, maxNearestCount, lNode, maxNearestDistance) {
    var step = 0,
        negativeFlag = true,
        positiveFlag = true,
        lowestIndex = 0,
        highestIndex = broadcasterList.length - 1,
        nearest = [bIndex];


    while (nearest.length < maxNearestCount) {
        step++;
        if (positiveFlag) {
            var nextLowerIndex = bIndex - step;
            if (nextLowerIndex >= lowestIndex) {
                nearest.push(nextLowerIndex);
            } else {
                positiveFlag = false;
            }
        }
        if (negativeFlag && nearest.length < maxNearestCount) {
            if (bIndex + step <= highestIndex) {
                nearest.push(bIndex + step);
            } else {
                negativeFlag = false;
            }
        }
        if (!positiveFlag && !negativeFlag) {
            return nearest.sort();
        }
    }
    return nearest.sort();

}

export function getNearbyBroadcaterIds(lNode) {

    var immediateIndexs = binarySearch(broadcasterList, lNode, 0, broadcasterList.length);
    var nearByBroadcasterIndexsArray = getNearByBroadcasterIndexsArray(broadcasterList, immediateIndex[0], 4);

    var ids = nearByBroadcasterIndexsArray.map(function(value) {
        var bNode = broadcasterList[value];
        return bNode.peer;
    });

    return ids;
}

//Orignal formular is root of sum of square of differences
function distance(coords1, coords2) {
    var sum = 0;
    sum += coords1.x - coords2.x;
    sum += coords1.y - coords2.y;
    sum += coords1.z - coords2.z;
    return sum;
}

/**
 data : [1,2,3,4]

 Output
 0 : [0,0] 
 2.5 : [1,2]
 3 : [2,2]
 5 : [3,4]
 */
function binarySearch(broadcasterList, node, lowIndex, highIndex) {

    var highIndex = highIndex;
    var lowIndex = lowIndex;

    if (highIndex > lowIndex) {
        var index = Math.floor((highIndex + lowIndex) / 2);

        var midCoords = broadcasterList[index].coords;
        var firstCoords = broadcasterList[lowIndex].coords;
        var lastCoords = broadcasterList[highIndex].coords;
        var currentCoords = node.coords;

        var distance_mid_new = distance(midCoords, currentCoords);
        var distance_first_new = distance(firstCoords, currentCoords);
        var distance_last_new = distance(lastCoords, currentCoords);

        //If first coords is farther than current coords
        if (distance_first_new > 0) {
            //if (broadcasterList[lowIndex] > val) {
            return [lowIndex - 1, lowIndex];
        } //If both the first & current coords are at same location
        else if (distance_first_new == 0) {
            return [lowIndex, lowIndex];
        } //If mid and current coords are at same location
        else if (distance_mid_new == 0) {
            return [index, index];
        } //If last and current coords are at same location
        else if (distance_last_new == 0) {
            return [highIndex, highIndex];
        } //If last coords are less father than current coords
        else if (distance_last_new < 0) {
            return [highIndex, highIndex + 1];
        } //If mid coords are farther than current coords
        else if (distance_mid_new > 0) {
            if (highIndex == index) {
                return [highIndex, lowIndex].sort();
            }
            highIndex = index;
        } else {
            if (lowIndex == index) {
                return [highIndex, lowIndex].sort();
            }
            lowIndex = index;
        }
        return binarySearch(broadcasterList, val, lowIndex, highIndex);
    }

    return [highIndex, lowIndex].sort();
}

//Add node to sorted broadcasterList
export function addToNodeList(node) {
    var immediateIndexs = binarySearch(broadcasterList, node, 0, broadcasterList.length);
    broadcasterList.splice(immediateIndexs[1], 0, node);
}

export function createNewNode(conn) {
    var newNode = Object.create(conn.metadata);
    newNode.peer = conn.peer;
    newNode.connection = {};
}
