const https = require('https')

function getBalance(cookie, xcsrftoken) {
  const settings = {
    hostname: 'economy.roblox.com',
    path: '/v1/user/currency',
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
        reject('Failed to fetch balance')
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
  getBalance: getBalance
}