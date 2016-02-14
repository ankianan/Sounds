import {
    createNode
}
from "./node.js";

/*import {
    createSuperUser
}
from "./peer/superUser/superUser.js";
*/
/*window.createSuperUser = createSuperUser;*/



window.registerUser = function(form) {
    var userMetadata = {
        "name": form.elements.name.value,
        "contact": form.elements.contact.value
            /*"type": form.elements.type.value,*/
    };
    createNode(userMetadata)
};
