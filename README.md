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
* listenToAll : Split gains among nearby Bnodes in ratio of their distance to Lnode
* listenToOne : Set gains of all other to 0. 

###Listener node

####Methods
* select : On Tap, call listenToOne method of Audio node.
* unselect : On Tap again, call listenToAll method of Audio node.

###Common to  Lnode and Bnode

####Methods
* navigate: On change of geolocation, notify server to update its coords.





 


