/**
 * Description : 
 * 	Removing super user 
 * 	Removing concept of type of user
 * 	Adding contact field for unuque identification of user
 */
import {
    createUser, querySuperUser
}
from "./peer/user/user.js";

/*import {
    createSuperUser
}
from "./peer/superUser/superUser.js";
*/
/*window.createSuperUser = createSuperUser;*/

window.registerUser = function(form) {
    var userMetadata = {
        "name": form.elements.name.value
        "contact" : form.elements.contact.value
        /*"type": form.elements.type.value,*/
    };
    createUser(userMetadata)
};
