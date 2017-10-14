const fs = require('fs')

fs.createReadStream('./static/redirect.html').pipe(fs.createWriteStream('./dist/redirect.html'))