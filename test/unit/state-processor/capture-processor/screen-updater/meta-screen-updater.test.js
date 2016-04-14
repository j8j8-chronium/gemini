'use strict';

var q = require('q'),
    MetaScreenUpdater = require('../../../../../lib/state-processor/capture-processor/screen-updater/meta-screen-updater'),
    Image = require('../../../../../lib/image'),
    temp = require('../../../../../lib/temp'),
    fs = require('q-io/fs');

describe('meta-screen-updater', function() {
    var sandbox = sinon.sandbox.create();

    function exec_(opts) {
        opts = opts || {};
        var updater = new MetaScreenUpdater(),
            capture = {
                image: new Image()
            },
            env = {
                refPath: opts.refPath
            };

        return updater.exec(capture, env);
    }

    beforeEach(function() {
        sandbox.stub(fs);
        sandbox.stub(temp);
        sandbox.stub(Image, 'compare');

        sandbox.stub(Image.prototype);
        Image.prototype.save.returns(q());

        fs.exists.returns(q.resolve(true));
        fs.makeTree.returns(q.resolve());
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should check file to exist once', function() {
        Image.compare.returns(q());

        return exec_()
            .then(function() {
                assert.calledOnce(fs.exists);
            });
    });

    it('should save temp image if reference image exists', function() {
        Image.compare.returns(q());
        fs.exists.returns(q.resolve(true));
        temp.path.returns('/temp/path');

        return exec_()
            .then(function() {
                assert.calledOnce(Image.prototype.save);
                assert.calledWith(Image.prototype.save, '/temp/path');
            });
    });

    it('should save new reference if it does not exist', function() {
        fs.exists.returns(q.resolve(false));

        return exec_({refPath: '/ref/path'})
            .then(function() {
                assert.calledOnce(Image.prototype.save);
                assert.calledWith(Image.prototype.save, '/ref/path');
            });
    });
});
