const express = require('express');
const bodyParser = require('body-parser');
var load = require('express-load');

module.exports = function() {
    var app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    

    // Config views
    app.use(express.static('./public'));
    app.set('view engine', 'ejs');
    app.set('views', './app/views');

    // Middlewares
    
    //Load Routers
    load('routers', { cwd: 'app' }).into(app);

    return app;
}