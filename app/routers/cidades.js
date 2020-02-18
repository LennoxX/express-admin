require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
let colecaoFotos = [];
let galeria;
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
                            imagem: body.data[i].descricao,
                            status: body.data[i].status,
                            galeria: {
                                id: body.data[i].galeria.id
                            },
                            polo: {
                                nome: body.data[i].polos.nome,
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
                url: process.env.API_HOST + "polos",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    polos = [];
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            status: body.data[i].status
                        };
                        polos.push(finalarea);
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/Create', { itensPolos: polos, page: rota, informacoes: req.session.usuario });
                        }
                    });
                }

            });
        }
    });

    // Rota para receber parametros via post criar item
    var cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'imgMuseu', maxCount: 1 }, { name: 'imgPraia', maxCount: 1 }, { name: 'imgPraca', maxCount: 1 }, { name: 'imgIgreja', maxCount: 1 }, { name: 'imgTeatro', maxCount: 1 }, { name: 'imgGastronomia', maxCount: 1 }, { name: 'imgPontosTuristicos', maxCount: 1 }]);
    app.post('/app/' + rota + '/create/submit', cpUpload, function (req, res) {

        if (req.files['photo'].size > 220220) {
            req.flash("danger", "Item não salvo. Sua imagem deve ter até 200kb.");
            res.redirect('/app/' + rota + '/list');
        } else {

            const file = req.files['photo'];
            let foto;
            if (file) {
                const buf = Buffer.from(file[0].buffer);
                foto = buf.toString('base64');
            } else {
                foto = process.env.PROFILE_IMG
            }
            const imgMuseu = req.files['imgMuseu'];
            let fotomuseu;
            if (imgMuseu) {
                const buf = Buffer.from(imgMuseu[0].buffer);
                fotomuseu = buf.toString('base64');
            } else {
                fotomuseu = process.env.PROFILE_IMG
            }
            const imgPraia = req.files['imgPraia'];
            let fotopraia;
            if (imgPraia) {
                const buf = Buffer.from(imgPraia[0].buffer);
                fotopraia = buf.toString('base64');
            } else {
                fotopraia = process.env.PROFILE_IMG;
            }
            const imgPraca = req.files['imgPraca'];
            let fotopraca;
            if (imgPraca) {
                const buf = Buffer.from(imgPraca[0].buffer);
                fotopraca = buf.toString('base64');
            } else {
                fotopraca = process.env.PROFILE_IMG;
            }
            const imgTeatro = req.files['imgTeatro'];
            let fototeatro;
            if (imgTeatro) {
                const buf = Buffer.from(imgTeatro[0].buffer);
                fototeatro = buf.toString('base64');
            } else {
                fotopraca = process.env.PROFILE_IMG;
            }
            const imgIgreja = req.files['imgIgreja'];
            let fotoigreja;
            if (imgIgreja) {
                const buf = Buffer.from(imgIgreja[0].buffer);
                fotoigreja = buf.toString('base64');
            } else {
                fotoigreja = process.env.PROFILE_IMG;
            }
            const imgGastronomia = req.files['imgGastronomia'];
            let fotogastronomia;
            if (imgGastronomia) {
                const buf = Buffer.from(imgGastronomia[0].buffer);
                fotogastronomia = buf.toString('base64');
            } else {
                fotogastronomia = process.env.PROFILE_IMG;
            }
            const imgPontosTuristicos = req.files['imgPontosTuristicos'];
            let fotopontos;
            if (imgPontosTuristicos) {
                const buf = Buffer.from(imgPontosTuristicos[0].buffer);
                fotopontos = buf.toString('base64');
            } else {
                fotopontos = process.env.PROFILE_IMG;
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
                    "nome": req.body.nome,
                    "status": req.body.status,
                    "temMuseu": req.body.temMuseu,
                    "imgMuseu": fotomuseu,
                    "temPraia": req.body.temPraia,
                    "imgPraia": fotopraia,
                    "temPraca": req.body.temPraca,
                    "imgPraca": fotopraca,
                    "temIgreja": req.body.temIgreja,
                    "imgIgreja": fotoigreja,
                    "temTeatro": req.body.temTeatro,
                    "imgTeatro": fototeatro,
                    "temGastronomia": req.body.temGastronomia,
                    "imgGastronomia": fotogastronomia,
                    "temPontosTuristicos": req.body.temPontosTuristicos,
                    "imgPontosTuristicos": fotopontos,
                    "comoChegar": req.body.comoChegar,
                    "comoChegar_es": req.body.comoChegar_es,
                    "comoChegar_en": req.body.comoChegar_en,
                    "imgCapa": foto,
                    "latitude": req.body.lat,
                    "longitude": req.body.long,
                    "polos": {
                        "id": req.body.polo
                    },
                    "texto": req.body.texto,
                    "texto_es": req.body.texto_es,
                    "texto_en": req.body.texto_en,
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
                url: process.env.API_HOST + "polos",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (validaRequisicao(response.statusCode, req, res)) {
                    polos = [];
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            status: body.data[i].status
                        };
                        polos.push(finalarea);
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
                                    comoChegar: body.data.comoChegar,
                                    comoChegar_es: body.data.comoChegar_es,
                                    comoChegar_en: body.data.comoChegar_en,
                                    nome: body.data.nome,
                                    imagem: body.data.imgCapa,
                                    status: body.data.status,
                                    temMuseu: body.data.temMuseu,
                                    imgMuseu: body.data.imgMuseu,
                                    temPraia: body.data.temPraia,
                                    imgPraia: body.data.imgPraia,
                                    temPraca: body.data.temPraca,
                                    imgPraca: body.data.imgPraca,
                                    temIgreja: body.data.temIgreja,
                                    imgIgreja: body.data.imgIgreja,
                                    temTeatro: body.data.temTeatro,
                                    imgTeatro: body.data.imgTeatro,
                                    temGastronomia: body.data.temGastronomia,
                                    imgGastronomia: body.data.imgGastronomia,
                                    temPontosTuristicos: body.data.temPontosTuristicos,
                                    imgPontosTuristicos: body.data.imgPontosTuristicos,
                                    latitude: body.data.latitude,
                                    longitude: body.data.longitude,
                                    poloId: body.data.polos.id,
                                    texto: body.data.texto,
                                    texto_es: body.data.texto_es,
                                    texto_en: body.data.texto_en,
                                    itensPolos: polos,
                                    informacoes: req.session.usuario,
                                    page: rota,
                                    galeriaId: body.data.galeria.id
                                });
                            }
                        });
                        colecaoFotos = body.data.galeria.imagens;
                        galeria = body.data.galeria;
                    });
                }


            });
        }
    });

    // Rota para receber parametros via post editar item
    var cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'imgMuseu', maxCount: 1 }, { name: 'imgPraia', maxCount: 1 }, { name: 'imgPraca', maxCount: 1 }, { name: 'imgIgreja', maxCount: 1 }, { name: 'imgTeatro', maxCount: 1 }, { name: 'imgGastronomia', maxCount: 1 }, { name: 'imgPontosTuristicos', maxCount: 1 }]);
    app.post('/app/' + rota + '/edit/submit', cpUpload, function (req, res) {

        if (req.files['photo'] == undefined) {
            req.file = {
                "buffer": undefined,
                "size": 8838
            };
        }

        if (req.files.size > 220220) {
            req.flash("danger", "Item não atualizado. Sua imagem deve ter até 200kb.");
            res.redirect('/app/' + rota + '/list');
        } else {
            let foto;
            const file = req.files['photo'];

            if (file) {
                const buf = Buffer.from(req.files['photo'][0].buffer);
                foto = buf.toString('base64');
            }
            let fotomuseu;
            if (req.files['imgMuseu']) {
                const buf = Buffer.from(req.files['imgMuseu'][0].buffer);
                fotomuseu = buf.toString('base64');
            }
            let fotopraia;
            if (req.files['imgPraia']) {
                const buf = Buffer.from(req.files['imgPraia'][0].buffer);
                fotopraia = buf.toString('base64');
            }
            let fotopraca;
            if (req.files['imgPraca']) {
                const buf = Buffer.from(req.files['imgPraca'][0].buffer);
                fotopraca = buf.toString('base64');
            }
            let fototeatro;
            if (req.files['imgTeatro']) {
                const buf = Buffer.from(req.files['imgTeatro'][0].buffer);
                fototeatro = buf.toString('base64');
            }
            let fotoigreja;
            if (req.files['imgIgreja']) {
                const buf = Buffer.from(req.files['imgIgreja'][0].buffer);
                fotoigreja = buf.toString('base64');
            }
            let fotogastronomia;
            if (req.files['imgGastronomia']) {
                const buf = Buffer.from(req.files['imgGastronomia'][0].buffer);
                fotogastronomia = buf.toString('base64');
            }
            let fotopontos;
            if (req.files['imgPontosTuristicos']) {
                const buf = Buffer.from(req.files['imgPontosTuristicos'][0].buffer);
                fotopontos = buf.toString('base64');
            }




            json = req.body;
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
                    "comoChegar": req.body.comoChegar,
                    "comoChegar_es": req.body.comoChegar_es,
                    "comoChegar_en": req.body.comoChegar_en,
                    "status": req.body.status,
                    "temMuseu": req.body.temMuseu,
                    "imgMuseu": fotomuseu,
                    "temPraia": req.body.temPraia,
                    "imgPraia": fotopraia,
                    "temPraca": req.body.temPraca,
                    "imgPraca": fotopraca,
                    "temIgreja": req.body.temIgreja,
                    "imgIgreja": fotoigreja,
                    "temTeatro": req.body.temTeatro,
                    "imgTeatro": fototeatro,
                    "temGastronomia": req.body.temGastronomia,
                    "imgGastronomia": fotogastronomia,
                    "temPontosTuristicos": req.body.temPontosTuristicos,
                    "imgPontosTuristicos": fotopontos,
                    "imgCapa": foto,
                    "latitude": req.body.lat,
                    "longitude": req.body.long,
                    "polos": {
                        "id": req.body.polo
                    },
                    "texto": req.body.texto,
                    "texto_es": req.body.texto_es,
                    "texto_en": req.body.texto_en,
                    "galeria": {
                        "id": req.body.galeriaId
                    }
                },
            }, function (error, response, body) {
                console.log(response.statusCode)
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
                url: process.env.API_HOST + rota + "/" + req.body.id,
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