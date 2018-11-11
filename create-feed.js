'use strict';

const fs = require('fs');
const highland = require('highland');

const grayMatter = require('gray-matter');

const fileNames = ['./src/writings/docker-node-exit-codes.md', './src/writings/your-own-secure-linux-box.md'];

highland(fileNames)
    .map(name => fs.createReadStream(name, {'encoding': 'utf8'}))
    .map(highland)
    .parallel(4)
    .map(grayMatter)
    .each(function (fileContent) {
        console.log('a', fileContent);
    });


/*
{
    "version": "https://jsonfeed.org/version/1",
    "title": "Selwyn's writings",
    "home_page_url": "https://selwyn.cc/",
    "feed_url": "https://selwyn.cc/feed.json",
    "items": [{
        "id": "",
        "url": "",
        "title": "",
        "content_text": "",
        "date_published": ""
    }],
}
*/
