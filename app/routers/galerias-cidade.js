require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
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
    app.get('/app/cidade/:cidade/galerias/list', function (req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "cidades/" + req.params.cidade,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, corpo) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    request({
                        url: process.env.API_HOST + 'galerias/' + corpo.data.galeria.id,
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                    }, function (error, response, body) {
                        let lista = {
                            id: body.data.id,
                            nome: corpo.data.nome,
                            status: body.data.status,
                            imagens: body.data.imagens
                        };
                        res.format({
                            html: function () {
                                res.render(rota + '/List', { itens: lista, page: rota, informacoes: req.session.usuario, nome: corpo.data.nome, idcidade: corpo.data.id });
                            }
                        });
                        return lista;
                    });
                }


            });

        }
    });

    // Rota para exibição da View Editar
    app.get('/app/cidade/:cidade/galerias/edit/', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "cidades/" + req.params.cidade,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, corpo) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    request({
                        url: process.env.API_HOST + "galerias/" + corpo.data.galeria.id,
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
                                    imagens: body.data.imagens,
                                    status: body.data.status,
                                    page: rota,
                                    nomeCidade: corpo.data.nome,
                                    cidade: corpo.data.id,
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
    app.post('/app/cidade/:cidade/galerias/edit/submit', upload.array('photo'), function (req, res) {
        var imagensGaleria = []

        if (req.files[0].size > 220220) {
            req.flash("danger", "Item não atualizado. Sua imagem deve ter até 200kb.");
            res.redirect('/app/cidade/' + req.params.cidade + '/galerias/list');
        } else {
            request({
                url: process.env.API_HOST + "galerias/" + req.body.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    imagensGaleria = body.data.imagens;
                    const files = req.files;
                    if (files) {
                        for (var i = 0; i < Object.keys(files).length; i++) {
                            const buf = Buffer.from(files[i].buffer);
                            let foto = { "imagem": buf.toString('base64') };
                            imagensGaleria.push(foto);
                        }
                    }

                    json = req.body;
                    request({
                        url: process.env.API_HOST + 'galerias',
                        method: "PUT",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                        json: {
                            "id": req.body.id,
                            "status": req.body.status,
                            "imagens": imagensGaleria,
                        },
                    }, function (error, response, body) {

                        console.log(response.statusCode);


                        if (response.statusCode != 200) {
                            req.flash("danger", "Item não atualizado. " + body.errors);
                        } else {
                            postLog(req.session.token, "PUT", rota, req.session.userid);
                            req.flash("success", "Item atualizado com sucesso.");
                        }

                        res.redirect('/app/cidade/' + req.body.cidade + '/galerias/list');
                        return true;
                    });
                }


            })
        }
    });

    // Rota para exclusão de um item
    app.post('/app/cidade/:cidade/galerias/delete/', function (req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "galerias/imagem/" + req.body.id,
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

                res.redirect('/app/cidade/' + req.params.cidade + '/galerias/list');
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