const fs = require('fs'),
    path = require('path');

const parseInput = (input) => {
    return new Promise((resolve, reject) => {
        // test string
        if (typeof input !== 'string' && !(input instanceof String)) {
            throw new Error('Input must be a string');
        }
        // test file
        if (fs.existsSync && fs.existsSync(path.normalize(input))) {
            fs.readFile(path.normalize(input), (err, data) => {
                if (err) throw err;
                resolve(data.toString());
            });
        } else {
            if (input.length < 64) throw new Error('Not enough text to process. At least 64 characters are expected.');
            resolve(input);
        }
    });
};

const getLang = (input) => {
    return new Promise((resolve, reject) => {
       require('retext')().use(require('retext-language')).use(() => {
           return (cst) => {
               resolve(cst);
           };
       }).process(input);
    });
};

const count = (ary, classifier) => {
    return ary.reduce((counter, item) => {
        var p = (classifier || String)(item);
        counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
        return counter;
    }, {});
};

const parseLang = (det) => {
    return new Promise((resolve, reject) => {
        let tmp = [];
        
        // calc each lang iteration
        for (let i in det.children) {
            for (let j in det.children[i].children) {
                if (det.children[i].children[j].data && det.children[i].children[j].data.language) {
                    tmp.push(det.children[i].children[j].data.language);
                }
            }
        }

        // sum up duplicates
        tmp = count(tmp);

        // find best lang
        let topLang = 0, lang, totalLang = 0;
        for (let k in tmp) {
            totalLang += tmp[k];
            if (tmp[k] > topLang) {
                topLang = tmp[k];
                lang = k;
            }
        }

        resolve({
            langcode: lang,
            probability: ((topLang / totalLang) * 100).toFixed(2),
            detection: tmp
        });
    });
};

const buildResponse = (inc) => {
    const iso639 = require('./iso-639.json');
    let declang = iso639[inc.langcode];

    if (!declang) throw new Error('Not a recognized language');

    if (declang.bibliographic) {
        declang.terminologic = iso639[declang.bibliographic].terminologic || null;
    } else {
        declang.bibliographic = declang.terminologic ? iso639[declang.terminologic].bibliographic : null;
    }
    if (declang.bibliographic === null && declang.terminologic === null) {
        declang.iso6392 = inc.langcode;
    } else {
        declang.iso6392 = null;
    }

    declang.probability = inc.probability;
    declang.detected_langs = inc.detection;

    return declang;
};

const DetectLang = module.exports = (input) => {
    return new Promise((resolve, reject) => {
        parseInput(input)
            .then(getLang)
            .then(parseLang)
            .then(buildResponse)
            .then(resolve)
            .catch(reject);
    });
};
