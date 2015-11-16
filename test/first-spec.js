var chai = require('chai');
var expect = chai.expect;

var utils = require('../src/js/utils.js');

describe('utils.isObject', function() {
  it('should exist', function() {
    expect(utils.isObject).to.exist;
  });

  it('should return false when passed a string.', function() {
    expect(utils.isObject('hello')).to.be.false;
  });

  it('should return true when passed an object', function() {
    var obj = new Object();
    expect(utils.isObject(obj)).to.be.true;
  });
});

