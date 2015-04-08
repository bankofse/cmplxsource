"use strict";

module.exports = {
  checkAuth: function (req, res, next) {
    if (req.headers.token) {
      try {
        let decoded = jwt.verify(req.headers.token, AUTHSECRET);
        req.autherizedAccount = {
          accountID: decoded['accept-user']
        };
      } catch(err) {
        console.log(err);
        next(new Error('Token Verification Failed'));
        return;
      }
      let origin = headers['x-real-ip'];
      // Check Origin and Expiration
      if ((decoded['accept-origin'] == origin) && moment(decoded['expires']).isAfter()){
          next();
      } else {
          let error = new Error('Token Error');
          error.status = 403;
          error.message = "Token is expired or origin was incorrect";
          next(error);
          return;
      }
    } else {
      let e = new Error("Not Authorized");
      e.status = 403;
      next(e);
    }
  }
}