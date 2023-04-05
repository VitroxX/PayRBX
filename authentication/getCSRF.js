const https = require('https')

function getCSRF(cookie) {
    const settings = {
        hostname: 'auth.roblox.com',
        path: '/v1/logout',
        method: 'POST',
        resolveWithFullResponse: true,
        headers: {
         'cookie': `.ROBLOSECURITY=${cookie}`,
        } 
    };

    return new Promise((resolve, reject) => {
        const request = https.request(settings, (res) => {
        const xcsrf = res.headers['x-csrf-token']
        if (xcsrf) {
            resolve(xcsrf)
        } else {
            reject('Did not receive X-CSRF-TOKEN')
        }
        });

        request.on('error', (err) => {
            reject(err)
        })

        request.end()
    })
}
  
module.exports = {
    getCSRF: getCSRF
}