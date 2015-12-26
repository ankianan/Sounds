import {
    createUser, querySuperUser
}
from "./peer/user/user.js";

import {
    createSuperUser
}
from "./peer/superUser/superUser.js";

window.createSuperUser = createSuperUser;

window.registerUser = function(form) {
    var userMetadata = {
        "name": form.elements.name.value,
        "type": form.elements.type.value,
    };
    createUser(userMetadata)
};
