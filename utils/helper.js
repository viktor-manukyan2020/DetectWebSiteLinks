const got = require('got');
const cheerio = require('cheerio');
const {logger} = require('../utils/logger');

const validLink = (str) => {
    logger.info('Start validLink - - -')
    const pattern = new RegExp('^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');
    return !!pattern.test(str);
}

const getPageLinks = async (url) => {
    try {
        logger.info('Start getPageLinks - - -')
        const response = await got(url);
        const html = response.body;
        const $ = cheerio.load(html);
        const linkObjects = $('a');
        const links = [];

        const baseUrl = url.split('/')[0] + '//' + url.split('/')[2];

        linkObjects.each((index, element) => {
            let href = $(element).attr('href');
            const isVisited = baseUrl + href === url;
            if (href) {
                let link = href;
                if (!validLink(href)) {
                    switch (true) {
                        case href === '/':
                            link = baseUrl + href;
                        case href.charAt(0) === '/' && href.length > 1:
                            link = baseUrl + href;
                            break;
                        case href.charAt(0) === '#' || href.indexOf('?') > -1:
                            link = baseUrl + '/' + href;
                            break;
                    }
                }
                links.push({
                    href: link,
                    statusCode: response.statusCode,
                    visited: isVisited
                });
            }
        });
        return links;
    } catch (e) {
        throw e
    }
};


const linksClassificationByBaseUrl = (arrayLinks, baseUrl) => {
    logger.info('Start linksClassification - - -')
    const websiteLinks = [];
    const otherWebsiteLinks = [];

    arrayLinks.forEach((element) => {
        element.href.includes(baseUrl) ? websiteLinks.push(element) : otherWebsiteLinks.push(element);
    })

    return {
        websiteLinks,
        otherWebsiteLinks
    };
};

const cleanRepeatItems = (websiteLinks, otherWebsiteLinks) => {
    logger.info('Start cleanRepeatItems - - -')
    return {
        websiteLinks: [...new Map(websiteLinks.map(item => [item['href'], item])).values()],
        otherWebsiteLinks: [...new Map(otherWebsiteLinks.map(item => [item['href'], item])).values()]
    };
};

const compareDifferent = (pageLinks) => {
    return function (currentLinks) {
        return pageLinks.filter(function (item) {
            return item.href == currentLinks.href;
        }).length == 0;
    }
}

module.exports = {
    getPageLinks,
    linksClassificationByBaseUrl,
    cleanRepeatItems,
    compareDifferent,
}
