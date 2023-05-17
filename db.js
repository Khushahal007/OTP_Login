const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('MongoDB Connected');
    })
    .catch((err) => {
        console.log('MongoDB Connect Failed', err);
    });

module.exports = mongoose;
