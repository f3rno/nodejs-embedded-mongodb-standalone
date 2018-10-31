'use strict';

var
  os = require('os'),
  promise = require('bluebird'),
  sprintf = require('sprintf-js').sprintf,
  logger = require('npmlog'),
  { MongoDBDownload } = require('mongodb-download'),
  errorHandler = require('../error/errorHandler'),

  INFO_MESSAGE_DOWNLOAD_STARTED = 'Starting download of mongodb %s to a mongodb-download directory under %s';

function download(version, downloadDir) {
  var downloadOptions = {
    version: version,
    downloadDir: (!!downloadDir) ? downloadDir : os.tmpdir()
  };
  
  logger.info('nems', sprintf(INFO_MESSAGE_DOWNLOAD_STARTED, downloadOptions.version, downloadOptions.download_dir));

  var mongodbDownload = new MongoDBDownload(downloadOptions);

  return mongodbDownload.download().catch(errorHandler.handleDownloadError);
}

module.exports.download = download;