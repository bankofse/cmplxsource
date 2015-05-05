var consts = require('../constants/const');

module.exports = {

	login (user, pass) {
		this.dispatch(consts.LOGIN_USER, { user, pass });
	},

	logout () {
		this.dispatch(consts.LOGOUT_USER, {});
	}

}