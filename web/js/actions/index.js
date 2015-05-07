"use strict";

var consts = require('../constants/const');

window.onhashchange = function (e) {
	window.flux.dispatcher.dispatch({ type : consts.HASH_CHANGE, payload : e });
}

module.exports = {

	login (user, pass) {
		this.dispatch(consts.LOGIN_USER, { user, pass });
	},

    login_complete () {
        this.dispatch(consts.LOGIN_USER_COMPLETE, {});
    },

	logout () {
		this.dispatch(consts.LOGOUT_USER, {});
	}

}
