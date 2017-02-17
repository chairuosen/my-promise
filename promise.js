function Promise(gen) {
    var _this = this;
    this.status = 'pending';
    this._queue = [];
    this._lastResult = null;
    this._gen = gen;
    setTimeout(function () {
        if(_this.status == 'pending'){
            _this._run();
        }
    },0)
}

function isPromise(obj) {
    if(!obj)return false;
    if(obj.then && typeof obj.then == 'function') return true;
    return false;
}
function clone(p) {
    var p1 = new Promise();
    p1._queue = p._queue.concat([]);
    p1._lastResult = p._lastResult;
    p1._gen = p._gen;
    p.status = 'done';
    return p1;
}

Promise.prototype = {
    then:function (callback,failback) {
        var _this = clone(this);
        _this._queue.push({
            callback:callback,
            failback:failback
        });
        return _this;
    },
    catch:function (failback) {
        return this.then(null,failback);
    },
    _saveResult:function (status,data) {
        this._lastResult = {
            status:status,
            data:data
        };
    },
    _run:function () {
        var _this = this;
        var count = 0;
        function next() {
            count ++ ;
            if(count>100){
                throw '111111';
                return;
            }
            _this._next(next)
        }
        next();
    },
    _next:function (callback) {
        var _this = this;
        if(this._gen){
            var gen = this._gen;
            this._gen = null;
            try{
                gen(function(data) {
                    _this._saveResult(true,data);
                    callback();
                },function(err) {
                    _this._saveResult(false,err);
                    callback();
                });
            }catch(e){
                _this._saveResult(false,e);
                callback();
            }

            return;
        }

        var item = this._queue.shift();
        var prevActionSucc,resData;
        if(this._lastResult){
            prevActionSucc = this._lastResult.status;
            resData = this._lastResult.data;
        }else{
            prevActionSucc = true;
            resData = undefined;
        }
        if(!item) {
            this.status = 'done';
            if(!prevActionSucc){
                console && console.error(resData);
            }
            return;
        }
        var action = prevActionSucc ? item.callback : item.failback;
        if(!action){
            this._saveResult(prevActionSucc,resData);
            callback();
            return;
        }
        try{
            var res = action(resData);
            if(isPromise(res)){
                res.then(function (data) {
                    _this._saveResult(true,data);
                    callback();
                },function (err) {
                    _this._saveResult(false,err);
                    callback();
                })
            }else{
                this._saveResult(true,res);
                callback();
            }
        }catch(e){
            this._saveResult(false,e);
            callback();
        }
    }
};

module.exports = Promise;
