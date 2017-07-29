module.exports = {
    port: 8081,
    staticPath: __dirname + '/static',
    mongodb: 'mongodb://localhost:27017/yaty',
    token: {
        secret: 'a]4@SjZed*FU>L-9563e',
        options: {
            expiresIn: 50400,
            audience: 'http://localhost:8090/',
            issuer: 'http://localhost:8081/'
        }
    },
    loggerLevel: 'debug'
};