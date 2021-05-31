var Service = require('node-windows').Service;
const path = require('path');
const __SERVICE = require('./setting.json').SERVICE;

const file = path.join(__dirname, 'app.js')
console.log(file);

//SC DELETE NJS_FETCH

var svc = new Service({
    name: __SERVICE.name,
    description: __SERVICE.description,
    script: file,
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ],
    env: [{
        name: "__ENV",
        value: "PROD"
    }]
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function () {
    console.log('Uninstall complete.');
    console.log('The service exists: ', svc.exists);
});

// Uninstall the service.
svc.uninstall();