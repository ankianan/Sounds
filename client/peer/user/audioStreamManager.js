var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

export function onCallByBnode(peer) {
    console.log(peer);
    peer.on('call', function(call) {
        /*getUserMedia.call(window.navigator, {
            video: true,
            audio: true
        }, 
        function(stream) {*/
        call.answer(); // Answer the call with an A/V stream.
        call.on('stream', function(remoteStream) {
            var video = document.querySelector('video');
            video.src = window.URL.createObjectURL(remoteStream);
            video.onloadedmetadata = function(e) {
                video.play();
            };
        });
        /*}
        , function(err) {
                    console.log('Failed to get local stream', err);
                });*/
    });
}

export function callLnode(lNodeId, peer) {
    getUserMedia.call(window.navigator, {
            video: true,
            audio: true
        }, function(stream) {
            var call = peer.call(lNodeId, stream);
            /*call.on('stream', function(remoteStream) {
                // Show stream in some video/canvas element.
                console.log(stream);

            });*/
        },
        function(err) {
            console.log('Failed to get local stream', err);
        });
}
