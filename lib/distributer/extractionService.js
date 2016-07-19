'use strict';

var
  os = require('os'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  Decompress = require('decompress'),

  ExtractionError = require('../error/errors').ExtractionError,

  DECOMPRESS_MODE_OPTIONS = {mode: 755},
  DECOMPRESS_ARCH_OPTIONS = {strip: 1},
  DEFAULT_EXTRACTION_DIR = 'mongodb-download',
  ERROR_MESSAGE_NO_FILE_FOR_EXTRACTION = 'missing file for extraction',
  ERROR_MESSAGE_NO_VERSION_FOR_EXTRACTION = 'missing version for extraction',
  ERROR_MESSAGE_UNPROCESSABLE_ARCH_TYPE = 'invalid arch type';

function isNilOrEmpty(variable) {
  return _.isNil(variable) || (_.isString(variable) && variable.length === 0);
}

function getDecompressFunctionName(file) {
  if (/\.zip$/.test(file)) {
    return 'zip';
  } else if (/\.(tar\.|t)?gz$/.test(file)) {
    return 'targz';
  } else if (/tar$/.test(file)) {
    return 'tar';
  } else if (/\.bz2$/.test(file)) {
    return 'tarbz2';
  }
  throw new ExtractionError(ERROR_MESSAGE_UNPROCESSABLE_ARCH_TYPE, 400);
}

function extract(file, version, extractionBaseDir) {
  return Promise.try(function () {

    if (isNilOrEmpty(file)) {
      throw new ExtractionError(ERROR_MESSAGE_NO_FILE_FOR_EXTRACTION);
    } else if (isNilOrEmpty(version)) {
      throw new ExtractionError(ERROR_MESSAGE_NO_VERSION_FOR_EXTRACTION);
    }

    var
      extractionDir = [(extractionBaseDir) ? extractionBaseDir : os.tmpdir(), DEFAULT_EXTRACTION_DIR, version].join('/'),
      fn = getDecompressFunctionName(file),
      decompress = Decompress(DECOMPRESS_MODE_OPTIONS),
      decompressPromiseResolve,
      decompressPromiseReject,

      decompressPromise = new Promise(function (resolve, reject) {
        decompressPromiseResolve = resolve;
        decompressPromiseReject = reject;
      });
    
    decompress
      .src(file)
      .dest(extractionDir)
      .use(Decompress[fn](DECOMPRESS_ARCH_OPTIONS))
      .run(function (err, files) {
        if (err) {
          decompressPromiseReject(err);
        }
        decompressPromiseResolve(files);
      });

    return decompressPromise;
  });
}

module.exports.extract = extract;