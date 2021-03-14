const {logger} = require('../utils/logger');
const {validateUrl} = require('../common/validation-schemas/detectWebsiteLinks');
const {success, validation, err} = require('../utils/responseApi');
const {getPageLinks, linksClassificationByBaseUrl, cleanRepeatItems, compareDifferent} = require('../utils/helper');

module.exports = {
    detectLinks: async (req, res) => {
        try {
            logger.info('Start detectLinks - - -');
            const {value, error} = validateUrl(req.body);

            if (error) return res.status(422).json(validation({message: error.stack}));
            const url = value.websiteUrl;
            const baseUrl = url.split('/')[0] + '//' + url.split('/')[2];

            const pageLinks = await getPageLinks(url);
            let allLinks = linksClassificationByBaseUrl(pageLinks, baseUrl);
            let cleanedAllLinks = cleanRepeatItems(allLinks.websiteLinks, allLinks.otherWebsiteLinks);

            for (let i = 0; i < cleanedAllLinks.websiteLinks.length; i++) {
                if (!cleanedAllLinks.websiteLinks[i].visited) {
                    cleanedAllLinks.websiteLinks[i].visited = true;

                    const notVisitedPageLinks = await getPageLinks(cleanedAllLinks.websiteLinks[i].href);
                    let allNotVisitedPageLinks = linksClassificationByBaseUrl(notVisitedPageLinks, baseUrl);
                    let cleanedNotVisitedPageLinks = cleanRepeatItems(allNotVisitedPageLinks.websiteLinks, allNotVisitedPageLinks.otherWebsiteLinks);

                    const differentLinks = cleanedNotVisitedPageLinks.websiteLinks.filter(compareDifferent(cleanedAllLinks.websiteLinks));
                    const differentOtherWebSiteLinks = cleanedNotVisitedPageLinks.otherWebsiteLinks.filter(compareDifferent(cleanedAllLinks.otherWebsiteLinks));

                    cleanedAllLinks.websiteLinks = [...cleanedAllLinks.websiteLinks, ...differentLinks];
                    cleanedAllLinks.otherWebsiteLinks = [...cleanedAllLinks.otherWebsiteLinks, ...differentOtherWebSiteLinks];

                }
            }
            console.log({
                websiteLinks: cleanedAllLinks.websiteLinks,
                otherWebsiteLinks: cleanedAllLinks.otherWebsiteLinks,
            });
            res.status(200).json(success("Success", {
                websiteLinks: cleanedAllLinks.websiteLinks,
                otherWebsiteLinks: cleanedAllLinks.otherWebsiteLinks,
            }, res.statusCode))

        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }
    }
}
