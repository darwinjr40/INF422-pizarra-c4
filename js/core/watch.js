'use strict'
const variables = require('./env');
const io = require('socket.io-client');
// const socket = io.connect('http://localhost:9090');
const socket = io.connect(variables.socket);
console.log('socket cargado...');

module.exports = {
    io,
    socket,
};