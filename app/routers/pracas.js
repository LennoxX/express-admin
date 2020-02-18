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
            teste = request({
                url: process.env.API_HOST + 'topicos/tipo/' + rota.toUpperCase() + '/0/10?sort=titulo!asc',
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    lista = [];
                    for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                        const finallista = {
                            id: body.data.content[i].id,
                            titulo: body.data.content[i].titulo,
                            status: body.data.content[i].status,
                            ordenacao: body.data.content[i].ordenacao,
                            galeria: {
                                id: body.data.content[i].galeria.id
                            },
                            cidade: {
                                nome: body.data.content[i].cidade.nome
                            }
                        };
                        lista.push(finallista);
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/List', { itens: lista, page: rota, number: body.data.number, totalPages: body.data.totalPages, informacoes: req.session.usuario });
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
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {


        if (req.file.size > 220220) {
            req.flash("danger", "Item não salvo. Sua imagem deve ter até 200kb.");
            res.redirect('/app/' + rota + '/list');
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
                url: process.env.API_HOST + 'topicos',
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "status": req.body.status,
                    "imgCapa": foto,
                    "titulo": req.body.titulo,
                    "latitude": req.body.lat,
                    "longitude": req.body.long,
                    "ordenacao": req.body.ordenacao,
                    "cidade": {
                        "id": req.body.cidade
                    },
                    "descricao": req.body.descricao,
                    "descricao_es": req.body.descricao_es,
                    "descricao_en": req.body.descricao_en,
                    "tipoTopicos": "PRACAS",
                    "galeria": {
                        "imagens": [
                            {
                                "imagem": foto
                            }
                        ],
                        "status": req.body.status
                    }
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
        }
    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
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
                    cidades = [];
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            status: body.data[i].status
                        };
                        cidades.push(finalarea);
                    }
                    request({
                        url: process.env.API_HOST + 'topicos' + "/" + req.params.id,
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
                                        imagem: body.data.imgCapa,
                                        status: body.data.status,
                                        latitude: body.data.latitude,
                                        longitude: body.data.longitude,
                                        cidadeId: body.data.cidade.id,
                                        descricao: body.data.descricao,
                                        descricao_es: body.data.descricao_es,
                                        descricao_en: body.data.descricao_en,
                                        itensCidades: cidades,
                                        informacoes: req.session.usuario,
                                        page: rota,
                                        galeriaId: body.data.galeria.id,
                                        ordenacao: body.data.ordenacao
                                    });
                                }
                            });
                            colecaoFotos = body.data.galeria.imagens
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
            }

            json = req.body;
            request({
                url: process.env.API_HOST + 'topicos',
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "id": req.body.id,
                    "status": req.body.status,
                    "imgCapa": foto,
                    "titulo": req.body.titulo,
                    "latitude": req.body.lat,
                    "longitude": req.body.long,
                    "ordenacao": req.body.ordenacao,
                    "cidade": {
                        "id": req.body.cidade
                    },
                    "descricao": req.body.descricao,
                    "descricao_es": req.body.descricao_es,
                    "descricao_en": req.body.descricao_en,
                    "tipoTopicos": "PRACAS",
                    "galeria": {
                        "id": req.body.galeriaId,
                    }
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
        }
    });

    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + 'topicos/' + req.body.id,
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

    app.post('/app/' + rota + '/list', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            var url;
            if (req.body.busca) {
                url = process.env.API_HOST + "topicos/tipo/PRACAS/" + req.body.busca + '/' + req.body.page + "/" + req.body.size;
            } else {
                url = process.env.API_HOST + "topicos/tipo/PRACAS/" + req.body.page + "/" + req.body.size + "?sort=titulo!asc";
            }
            teste = request({
                url: encodeURI(url),
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                    const finallista = {
                        id: body.data.content[i].id,
                        titulo: body.data.content[i].titulo,
                        status: body.data.content[i].status,
                        ordenacao: body.data.content[i].ordenacao,
                        galeria: {
                            id: body.data.content[i].galeria.id
                        },
                        cidade: {
                            nome: body.data.content[i].cidade.nome
                        }
                    };
                    lista.push(finallista);
                }

                return res.json({
                    itens: lista,
                    page: rota,
                    number: body.data.number,
                    totalPages: body.data.totalPages
                });

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