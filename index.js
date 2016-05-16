var fs = require('fs'),
    path = require('path');

var parseInput = function (input) {
    return new Promise(function (resolve, reject) {
        // test string
        if (typeof input !== 'string' && !(input instanceof String)) {
            throw new Error('Input must be a string');
        }
        // test file
        if (fs.existsSync(path.normalize(input))) {
            fs.readFile(path.normalize(input), function (err, data) {
                if (err) throw err;
                resolve(data.toString());
            });
        } else {
            if (input.length < 64) throw new Error('Not enough text to process. At least 64 characters are expected.');
            resolve(input);
        }
    });
};

var getLang = function (input) {
    return new Promise(function (resolve, reject) {
       require('retext').use(require('retext-language')).use(function () {
           return function (cst) {
               resolve(cst);
           }
       }).process(input)
    });
};

var count = function(ary, classifier) {
    return ary.reduce(function(counter, item) {
        var p = (classifier || String)(item);
        counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
        return counter;
    }, {})
};

var parseLang = function (det) {
    return new Promise(function (resolve, reject) {
        var tmp = [];
        
        // calc each lang iteration
        for (var i in det.children) {
            for (var j in det.children[i].children) {
                if (det.children[i].children[j].data && det.children[i].children[j].data.language) {
                    tmp.push(det.children[i].children[j].data.language);
                }
            }
        }

        // sum up duplicates
        tmp = count(tmp);

        // find best lang
        var topLang = 0, lang, totalLang = 0;
        for (var k in tmp) {
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

var buildResponse = function (inc) {
    var iso639 = require('./iso-639.json');
    var declang = iso639[inc.langcode];

    if (!declang) throw new Error('Not a recognized language');

    if (declang.bibliographic) {
        declang.terminologic = iso639[declang.bibliographic].terminologic || null;
    } else {
        declang.bibliographic = declang.terminologic ? iso639[declang.terminologic].bibliographic : null;
    }
    if (declang.bibliographic == null && declang.terminologic == null) {
        declang.iso6392 = inc.langcode;
    } else {
        declang.iso6392 = null;
    }

    declang.probability = inc.probability;
    declang.detected_langs = inc.detection;

    return declang;
}

var DetectLang = module.exports = function (input) {
    return new Promise(function (resolve, reject) {
        parseInput(input)
            .then(getLang)
            .then(parseLang)
            .then(buildResponse)
            .then(resolve)
            .catch(reject);
    });
};