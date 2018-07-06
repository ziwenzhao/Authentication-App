const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let url;
// The mongodb connection url is set according to the develop environment.
//      If the environment is production on heroku, it will connect to a mlab database on heroku.
//      If the environment is development, it will connect to a local database called myApp.
//      If the environment is test, it will connect to a a local database called test.
if (process.env.NODE_ENV === 'production') {
    url = process.env.MONGODB_URI;
} else if (process.env.NODE_ENV === 'test') {
    url = "mongodb://localhost:27017/test";
} else {
    url = "mongodb://localhost:27017/myApp"
}
mongoose.connect(url).then(
    data => { console.log('mongodb connected!') }
).catch(e => { console.log('mongoose connection failed!', e) });

module.exports = mongoose;