const __ENV = process.env.__ENV || 'DEV';
const __SETTING = require('./setting.json')[__ENV];
console.log(__SETTING);

const fetch = require('node-fetch'); 
env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const Redis = require("ioredis");
const redis = new Redis(__SETTING.REDIS_CONNECT);

const path = require('path');
const URL = require('url');
const fs = require('fs');
const lz4 = require('lz4');

const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static('www'))
app.use('/site', express.static('site'))


function __mkdirpath(dirPath) {
    const directory = path.normalize(dirPath);

    return new Promise((resolve, reject) => {
        fs.stat(directory, (error) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    fs.mkdir(directory, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(directory);
                        }
                    });
                } else {
                    reject(error);
                }
            } else {
                resolve(directory);
            }
        });
    });
}

async function __list(min, max, url__) {
    for (var i = min; i < max; i++) {
        const url = url__.split('___').join(i);

        console.log(i, max, url);

        const _uri = URL.parse(url);
        const hostName = _uri.hostname;
        let domain = hostName.replace(/^[^.]+\./g, '').toLowerCase();

        const response = await fetch(url);
        const body = await response.buffer();
        //console.log(_uri);
        const bufZip = lz4.encode(body);

        redis.hset(domain + ':list', _uri.path, bufZip);
    }
    redis.bgsave();
}

app.get("/list", async (req, res) => {
    let url = req.query.url;
    const min = req.query.min || 1;
    const max = req.query.max || 3;
    if (url == null || url.length == 0) return res.send('');
    setTimeout(function () { __list(min, max, url); }, 1);
    res.redirect('/');


    //var dir = path.join(ROOT_SITE, domain);
    //console.log(dir);
    //__mkdirpath(dir).then(async (_path) => {        
    //    const response = await fetch(url);
    //    const body = await response.buffer();
    //    console.log(body.length);

    //    //var input = fs.readFileSync('test');
    //    var output = lz4.encode(body);
    //    var file = path.join(dir, 'test.lz4');
    //    fs.writeFileSync(file, output);

    //    res.end(body);
    //}).catch((error) => {
    //    console.log(`Problem creating directory: ${error.message}`);
    //    res.end(error.message);
    //});
});

server.listen(__SETTING.HTTP_PORT, () => {
    console.log('PORT = ' + __SETTING.HTTP_PORT);
    console.log('PATH = ' + __dirname);
});
