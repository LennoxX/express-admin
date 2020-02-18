require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
const S = require('string');
let colecaoFotos = [];
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
            request({
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
                            nome: body.data[i].nome,
                            cidade: {
                                nome: body.data[i].cidade.nome
                            }
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
            request({
                url: process.env.API_HOST + "cidades",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    cidades = [];
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            status: body.data[i].status
                        };
                        cidades.push(finalarea);
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/Create', { itensCidades: cidades, page: rota, informacoes: req.session.usuario });
                        }
                    });
                }

            });

            /*   res.format({
                   html: function () {
                       res.render(rota + '/Create', { page: rota });
                   }
               }); */
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', function (req, res) {
        request({
            url: process.env.API_HOST + rota,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "nome": req.body.nome,
                "cidade": {
                    "id": req.body.cidade
                },
                "sobre": req.body.sobre,
                "sobre_es": req.body.sobre_es,
                "sobre_en": req.body.sobre_en
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não salvo. " + body.errors);
            } else {
                postLog(req.session.token, "POST", rota, req.session.userid);
                req.flash("success", "Item salvo com sucesso.");
            }

            res.redirect('/app/' + rota + '/list');
            return true;
        });
    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
        cidades = [];
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {

            request({
                url: process.env.API_HOST + "cidades",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            status: body.data[i].status
                        };
                        cidades.push(finalarea);
                    }
                    request({
                        url: process.env.API_HOST + rota + "/" + req.params.id,
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                    }, function (error, response, body) {
                        res.format({
                            html: function () {
                                res.render(rota + '/Edit', {
                                    id: body.data.id,
                                    nome: body.data.nome,
                                    cidadeId: body.data.cidade.id,
                                    sobre: body.data.sobre,
                                    sobre_es: body.data.sobre_es,
                                    sobre_en: body.data.sobre_en,
                                    itensCidades: cidades,
                                    page: rota,
                                    informacoes: req.session.usuario
                                });
                            }
                        });
                    });
                }

            });


        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', function (req, res) {
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
                "nome": req.body.nome,
                "cidade": {
                    "id": req.body.cidade
                },
                "sobre": req.body.sobre,
                "sobre_es": req.body.sobre_es,
                "sobre_en": req.body.sobre_en
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não atualizado. " + body.errors);
            } else {
                postLog(req.session.token, "PUT", rota, req.session.userid);
                req.flash("success", "Item atualizado com sucesso.");
            }

            res.redirect('/app/' + rota + '/list');
            return true;
        });
    });

    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + '/' + req.body.id,
                method: "DELETE",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não excluído. " + body.errors);
                } else {
                    postLog(req.session.token, "DELETE", rota, req.session.userid);
                    req.flash("success", "Item excluído com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
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