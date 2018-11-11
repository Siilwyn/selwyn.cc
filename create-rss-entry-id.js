const uuidv5 = require('uuid/v5');

const base = uuidv5('selwyn.cc', uuidv5.DNS);

console.log('urn:uuid:' + uuidv5(process.argv[2], base))
