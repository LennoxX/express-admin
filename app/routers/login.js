require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');

module.exports = async function(app) {
    app.use(cookieParser());
    app.use(session({ secret: "2C44-4D44-WppQ38S" }));

    app.get('/app/login/', function (req, res) {

        if (req.session.token == null) {
            res.format({
                html: function () {
                    res.render('login');
                }
            });
        } else {
            res.format({
                html: function () {
                    res.redirect('/');
                }
            });
        }
    });


    app.post('/app/authentication/', function(req, res) {

        request({
            url: process.env.API_HOST_LOGIN,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json"
            },
            json: {
                "password": req.body.password,
                "username": req.body.email,
            },
        }, function(error, response, body) {
            if (response.statusCode != 201) {
                req.flash("danger", body.errors);
                res.redirect('/');
                return false;
            } else {
                req.session.token = body.accessToken;
                req.session.usuario = body.usuario
                req.session.usuario.nivel = body.usuario.niveis[0],
                req.session.userid = body.usuario.id;
                res.redirect('/');
                return true;
            }
             
        });

    });

    app.get('/app/sair', function(req, res) {
        req.session.destroy();
        res.redirect('/app/login');
    });

}
