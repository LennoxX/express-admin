require('dotenv').config();
const app = require('./config/express')();
const http = require('http').Server(app);
const cookieParser = require('cookie-parser');
const session = require('express-session');

const io = require('socket.io')(http);


app.use((req, res, next) => {
    req.io = io;
    return next();
});

app.use(cookieParser());
app.use(session({
    secret: "2C44-4D44-WppQ38S"
}));

http.listen(process.env.SERVER_PORT, function () {
    console.log("Servidor Ativo!");
});

app.get('/', (req, res) => {


    console.log('RESPONDENDO AO ROUTER');
    if (!req.session.token) {
        res.redirect('/app/login');
    } else {
        res.format({
            html: function () {
                res.render('template/index',{informacoes: req.session.usuario});
            }
        });
    }
});