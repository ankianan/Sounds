# Idea2

There can be two type of nodes in network
* Broadcaster node
* Listener node

If Bnode (Broadcaster node) joins:
* Register to DB
* Add listener on Bnode to listen to peer-connection by Lnode.
 * On connection with Lnode, call the Lnode with audio stream
 
If Lnode (Listener node) joins:
* Register to DB
* Add listener on Lnode to listen to call by Bnode.
* On stream available:
 * Create audio node and provide this steam as source to it.
 
###Mongo DB
```javascript
{
  id : String,
  type : String,
  coords : {
        x: Number,
        y: Number,
        z: Number
    }
}
```

####Methods
* insertrNode
* getNearbyBnode
* updateNode

###Audio node

Nearby broadcasters stream are sourced to client using audio node.

####Methods
* setListenerOrientation : Set location of listener.
* listenToAll : Split gains among nearby Bnodes in ratio of their distance to Lnode
* listenToOne : Set gains of all other to 0. 

###Broadcaster node

####Methods
* notifyServer : Take broadcasters id and coords as Param
* notifyConnectedPeers : Take array of peer ids and current coords as arguments.

###Listener node

####Members
* threshold : Maximum distance between listener and nearby broadcaster

####Methods
* distance : Same as on server side, calculate distance between two coords.
* isInRange : Return true if distance between source and listener is less than equal to threshold.
* refreshSources : On being notified from broadcaster, call isInRange
* select : On Tap, call listenToOne method of Audio node.
* unselect : On Tap again, call listenToAll method of Audio node.

###Geo location

####Methods
* getDistance : Returns distance between two nodes
* watchPosition : On location change
 * Broadcaster notifies server and connected peers about location change
 * Connected listeners refresh its source based on new coords.
  





 


