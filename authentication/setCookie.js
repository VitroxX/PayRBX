const https = require('https')

function setCookie(cookie, xcsrftoken) {
  const settings = {
    hostname: 'users.roblox.com',
    path: '/v1/users/authenticated',
    method: 'GET',
    resolveWithFullResponse: true,
    followRedirect: false,
    headers: {
      'cookie': `.ROBLOSECURITY=${cookie}`,
      'x-csrf-token': `${xcsrftoken}`
    }    
  };

  return new Promise((resolve, reject) => {
    const request = https.request(settings, (res) => {
      if (res.statusCode !== 200) {
        reject('Failed to login')
      } else {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        const json = JSON.parse(data)
        resolve(json)
      })
      }
    })

    request.on('error', (err) => {
      reject(err)
    })

    request.end()
  })
}

module.exports = {
  setCookie: setCookie
}