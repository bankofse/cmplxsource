var consts = require('../constants/const');

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
