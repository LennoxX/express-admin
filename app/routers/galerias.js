require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();

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
    app.get('/app/:topico/' + rota + '/list', function (req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "topicos/" + req.params.topico,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, corpo) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    request({
                        url: process.env.API_HOST + rota + '/' + corpo.data.galeria.id,
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                    }, function (error, response, body) {
                        let lista = {
                            id: body.data.id,
                            nome: corpo.data.titulo,
                            status: body.data.status,
                            imagens: body.data.imagens
                        };
                        res.format({
                            html: function () {
                                res.render(rota + '/List', { itens: lista, page: rota, informacoes: req.session.usuario, nome: corpo.data.titulo, idtopico: corpo.data.id });
                            }
                        });
                        return lista;
                    });
                }
            });
        }
    });

    // Rota para exibição da View Editar
    app.get('/app/:topico/' + rota + '/edit/', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "topicos/" + req.params.topico,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, corpo) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    request({
                        url: process.env.API_HOST + rota + "/" + corpo.data.galeria.id,
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
                                    nomeCidade: corpo.data.titulo,
                                    topico: corpo.data.id,
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
    app.post('/app/:topico/' + rota + '/edit/submit', upload.array('photo'), function (req, res) {
        var imagensGaleria = []
        if (req.files[0].size > 220220) {
            req.flash("danger", "Item não atualizado. Sua imagem deve ter até 200kb.");
            res.redirect('/app/' + req.params.topico + '/galerias/list');
        } else {
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
                url: process.env.API_HOST + rota + "/adicionar",
                method: "POST",
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

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não atualizado. " + body.errors);
                } else {
                    postLog(req.session.token, "PUT", rota, req.session.userid);
                    req.flash("success", "Item atualizado com sucesso.");
                }

                res.redirect('/app/' + req.body.topico + '/' + rota + '/list');
                return true;
            });
        }
    });

    // Rota para exclusão de um item
    app.post('/app/:topico/' + rota + '/delete/', function (req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/imagem/" + req.body.id,
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

                res.redirect('/app/' + req.params.topico + '/' + rota + '/list');
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