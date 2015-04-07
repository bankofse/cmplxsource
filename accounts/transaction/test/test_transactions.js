var request = require('supertest'),
    app     = require('../app'),
    test    = request(app)
;


describe('/create', function(){
  
    test.post('/create')
        .expect('Content-Type', /json/)
        .expect(200)

});
