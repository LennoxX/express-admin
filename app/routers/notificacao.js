require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
var mqtt = require('mqtt');
var FCM = require('fcm-node');
var serverKey = 'AAAAt5o4chc:APA91bGd3uphLXPQy8-6yyQvLxTtjm8M0jw1oJ73Z4cYrc2qks-obWp7tg5PoHNffFZaZAAnw2VL7iZ71g6l65hAaBQOkgoo590cHXLKS-I4lpM7yXeNOJu4uq7Dl7VPwtOSMlatWv2D'; //put your server key here
var fcm = new FCM(serverKey);
var moment = require('moment');

module.exports = async function (app) {

    app.use(cookieParser());
    app.use(session({
        secret: "2C44-4D44-WppQ38S"
    }));

    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    // Rota para exibição da View Listar
    app.get('/app/' + rota + '/list', function (req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            teste = request({
                url: process.env.API_HOST + rota,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    lista = [];
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finallista = {
                            id: body.data[i].id,
                            titulo: body.data[i].titulo,
                            enviada: body.data[i].enviada
                        };
                        lista.push(finallista);
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/List', { itens: lista, page: rota, informacoes: req.session.usuario });
                        }
                    });
                    return lista;
                }

            });
        }
    });

    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            res.format({
                html: function () {
                    res.render(rota + '/Create', { page: rota });
                }
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {
        if (req.file.size > 220220) {
            req.flash("danger", "Item não salvo. Sua imagem deve ter até 200kb.");
            res.redirect('/app/' + rota + '/create');
        } else {
            const file = req.file;
            let foto;
            if (file) {
                const buf = Buffer.from(req.file.buffer);
                foto = buf.toString('base64');
            } else {
                foto = process.env.PROFILE_IMG
            }
            request({
                url: process.env.API_HOST + rota,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "titulo": req.body.titulo,
                    "imagem": foto,
                    "resumo": req.body.resumo,
                    "mensagem": req.body.mensagem
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Não foi possível enviar a notificação.");
                    res.redirect('/app/' + rota + '/list');
                } else {
                    var message = {
                        to: "/topics/setur",
                        collapse_key: "br.gov.ma.maranhaodeencantos",
                        notification: {
                            title: req.body.titulo,
                            body: req.body.resumo,
                        },
                        data: {
                            click_action: "FLUTTER_NOTIFICATION_CLICK",
                            endpoint: process.env.API_HOST + rota + "/" + body.data.id
                        }
                    };

                    fcm.send(message, function (err, response) {
                        if (err) {
                            req.flash("danger", "Não foi possível enviar a notificação.");
                            res.redirect('/app/' + rota + '/list');
                        } else {
                            request({
                                url: process.env.API_HOST + rota,
                                method: "PUT",
                                json: true,
                                headers: {
                                    "content-type": "application/json",
                                    "Authorization": req.session.token
                                },
                                json: {
                                    "id": body.data.id,
                                    "titulo": req.body.titulo,
                                    "imagem": foto,
                                    "resumo": req.body.resumo,
                                    "mensagem": req.body.mensagem,
                                    "enviada": true
                                },
                            }, function (error, response, body) {

                                if (response.statusCode != 200) {
                                    req.flash("danger", "Não foi possível enviar a notificação.");
                                    res.redirect('/app/' + rota + '/list');
                                } else {
                                    postLog(req.session.token, "POST", rota, req.session.userid);
                                    req.flash("success", "Notificação enviada com sucesso.");
                                    res.redirect('/app/' + rota + '/list');
                                }
                            });

                        }
                    });
                }
                return true;
            });

        }

    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    res.format({
                        html: function () {
                            res.render(rota + '/Edit', {
                                id: body.data.id,
                                titulo: body.data.titulo,
                                imagem: body.data.imagem,
                                resumo: body.data.resumo,
                                mensagem: body.data.mensagem,
                                page: rota,
                                informacoes: req.session.usuario
                            });
                        }
                    });
                }


            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {

        if (req.file == undefined) {
            req.file = {
                "buffer": undefined,
                "size": 8838
            };
        }

        if (req.file.size > 220220) {
            req.flash("danger", "Item não salvo. Sua imagem deve ter até 200kb.");
            res.redirect('/app/' + rota + '/list');
        } else {
            let foto;
            if (req.file.buffer != undefined) {
                const file = req.file;

                if (file) {
                    const buf = Buffer.from(req.file.buffer);
                    foto = buf.toString('base64');
                }
            } else {
                foto = req.body.imagematual;
            }

            request({
                url: process.env.API_HOST + rota,
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "id": req.body.id,
                    "titulo": req.body.titulo,
                    "imagem": foto,
                    "resumo": req.body.resumo,
                    "mensagem": req.body.mensagem
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Não foi possível enviar a notificação.");
                    res.redirect('/app/' + rota + '/list');
                } else {
                    var message = {
                        to: "/topics/setur",
                        collapse_key: "br.gov.ma.maranhaodeencantos",
                        notification: {
                            title: req.body.titulo,
                            body: req.body.resumo,
                        },
                        data: {
                            click_action: "FLUTTER_NOTIFICATION_CLICK",
                            endpoint: process.env.API_HOST + rota + "/" + body.data.id
                        }
                    };

                    fcm.send(message, function (err, response) {
                        if (err) {
                            req.flash("danger", "Não foi possível enviar a notificação.");
                            res.redirect('/app/' + rota + '/list');
                        } else {
                            request({
                                url: process.env.API_HOST + rota,
                                method: "PUT",
                                json: true,
                                headers: {
                                    "content-type": "application/json",
                                    "Authorization": req.session.token
                                },
                                json: {
                                    "id": body.data.id,
                                    "titulo": req.body.titulo,
                                    "imagem": foto,
                                    "resumo": req.body.resumo,
                                    "mensagem": req.body.mensagem,
                                    "enviada": true
                                },
                            }, function (error, response, body) {

                                if (response.statusCode != 200) {
                                    req.flash("danger", "Não foi possível enviar a notificação.");
                                    res.redirect('/app/' + rota + '/list');
                                } else {
                                    postLog(req.session.token, "PUT", rota, req.session.userid);
                                    req.flash("success", "Notificação enviada com sucesso.");
                                    res.redirect('/app/' + rota + '/list');
                                }
                            });

                        }
                    });
                }
                return true;
            });
        }
    });


}


function validaRequisicao(statusCode, req, res) {
    if (statusCode != 401) {
        return true
    } else {
        req.flash("danger", "Sessão Expirada! Faça o login novamente");
        req.session.token = null;
        res.redirect('/app/login');
    }
}
function postLog(token, acao, item, userid) {

    var datetime = moment().format();

    request({
        url: process.env.API_HOST + "log",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
            "Authorization": token
        },
        json: {
            "token": token,
            "dateTime": datetime,
            "acao": acao,
            "item": item,
            "usuario": { "id": userid }
        },
    }, function (error, response, body) {

        if (response.statusCode != 200) {
            console.log(body.errors);
        } else {
        }
        return true;
    });
}