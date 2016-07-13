'use strict';

var
  rewire = require('rewire'),
  promise = require('bluebird'),
  sprintf = require('sprintf-js').sprintf;

describe('downloadServiceSpec', function () {

  var
    underTest,
    mongodbDownloadMock,
    errorHandlerMock,
    loggerMock,

    ANY_VALID_VERSION = 'ANY_VALID_VERSION',
    ANY_INVALID_VERSION = 'ANY_INVALID_VERSION',
    ANY_DOWNLOAD_DIR = 'ANY_DOWNLOAD_DIR',
    ANY_VALID_DATA = 'ANY_VALID_DATA',
    ANY_ERROR_MESSAGE = 'ANY_ERROR_MESSAGE',
    ANY_ERROR = new Error(ANY_ERROR_MESSAGE),
    EXPECTED_OPTIONS = {version: ANY_VALID_VERSION, download_dir: ANY_DOWNLOAD_DIR},
    LOG_MESSAGE = 'Download mongodb %s to %s',
    EXPECTED_LOG_MESSAGE = sprintf(LOG_MESSAGE, ANY_VALID_VERSION, ANY_DOWNLOAD_DIR);

  beforeEach(function () {
    mongodbDownloadMock = jasmine.createSpy('mongodbDownload');
    mongodbDownloadMock.and.returnValue(promise.resolve(ANY_VALID_DATA));

    errorHandlerMock = jasmine.createSpyObj('errorHandlerMock', ['handleDownloadError']);
    errorHandlerMock.handleDownloadError.and.throwError(ANY_ERROR_MESSAGE);

    loggerMock = jasmine.createSpyObj('logger', ['info']);

    underTest = rewire('../../../lib/distributer/downloadService');
    underTest.__set__('mongodbDownload', mongodbDownloadMock);
    underTest.__set__('errorHandler', errorHandlerMock);
    underTest.__set__('logger', loggerMock);
    underTest.__set__('INFO_MESSAGE_DOWNLOAD_STARTED', LOG_MESSAGE);
  });

  it('should be defined', function () {
    expect(underTest).toBeDefined();
  });

  describe('download', function () {

    it('should be defined', function () {
      expect(underTest.download).toBeDefined();
    });

    it('should throw an error if mongodbDownload fails', function (done) {
      mongodbDownloadMock.and.returnValue(promise.reject(ANY_ERROR));

      underTest.download().then(function () {
        done.fail('Error should have been caught');
      }).catch(function (err) {
        expect(err).toEqual(ANY_ERROR);
        done();
      });
    });

    it('should call mongodbDownload with download options', function (done) {
      underTest.download(ANY_VALID_VERSION, ANY_DOWNLOAD_DIR).then(function () {
        expect(mongodbDownloadMock).toHaveBeenCalledWith(EXPECTED_OPTIONS);
        expect(loggerMock.info.calls.argsFor(0)[1]).toEqual(EXPECTED_LOG_MESSAGE);
        done();
      });
    });
  });
});