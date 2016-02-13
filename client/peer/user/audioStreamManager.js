
var AudioContext = window.AudioContext || window.webkitAudioContext;

var audioCtx = new AudioContext(),
    pannerMap = {};

function creatPanner(peer, coords) {
    var panner = audioCtx.createPanner();

    pannerMap[peer] = panner;

    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;
    panner.setOrientation(coords.x, coords.y, coords.z);

}
export function disconnectPanner(bnodeId) {
    pannerMap[bnodeId].discConnect();
}
export function setPannerOrientation(bnodeId, coords) {
    pannerMap[bnodeId].setOrientation(coords.x, coords.y, coords.z);
}

export function setListenerOrientation(coords) {
    var listener = audioCtx.listener;
    listener.setOrientation(0, 0, -1, 0, 1, 0);
}

export function listenToAll() {


}



