const https = require('https')

function getUsers(id) {
  const settings = {
    hostname: 'users.roblox.com',
    path: '/v1/users/'+id,
    method: 'GET',
    resolveWithFullResponse: true,
    followRedirect: false
  };

  return new Promise((resolve, reject) => {
    const request = https.request(settings, (res) => {
      if (res.statusCode !== 200) {
        reject('Failed to fetch data for ID : '+id)
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
  getUsers: getUsers
}