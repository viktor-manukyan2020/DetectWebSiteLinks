const Joi = require('joi');
const {logger} = require('../../utils/logger');

const pattern = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');

const validateUrl = (data) => {
    logger.info('Start validate websiteUrl - - -')
    const schema = Joi.object().keys({
        websiteUrl: Joi.string().regex(RegExp(pattern)).required(),
    });
    return schema.validate(data);
};

module.exports = {
    validateUrl: validateUrl,
};
