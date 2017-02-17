function Promise(gen) {
    var _this = this;
    this._isPromise = true;
    this.queue = [];
    this.lastSuccData = undefined;
    this.lastFailData = undefined;
    setTimeout(function () {
        try{
            gen(function resolve(data) {
                _this.lastSuccData = data;
                _this._start(true);
            },function reject(data) {
                _this.lastFailData = data;
                _this._start(false);
            });
        }catch(e){
            _this.lastFailData = data;
            _this._start(false);
        }
    },0)
}

function isPromise(obj) {
    if(obj._isPromise)return true;
    if(obj.then && obj.catch) return true;
    return false;
}

Promise.prototype = {
    then:function (callback,failback) {
        this.queue.push({
            callback:callback,
            failback:failback
        });
        return this;
    },
    catch:function (failback) {
        this.queue.push({
            failback:failback
        });
        return this;
    },
    _start:function (prevActionSucc) {
        var _this = this;
        function next(prevActionSucc) {
            var item = _this.queue.shift();
            if(!item) return;
            var action = prevActionSucc ? item.callback : item.failback;
            var lastData = prevActionSucc ? _this.lastSuccData : _this.lastFailData;

            try{
                var res = action(lastData);
                if(res && isPromise(res)){
                    res.then(function (data) {
                        _this.lastSuccData = data;
                        _this.lastFailData = undefined;
                        next(true);
                    },function (err) {
                        _this.lastSuccData = undefined;
                        _this.lastFailData = err;
                        next(false);
                    })
                }else{
                    _this.lastSuccData = res;
                    _this.lastFailData = undefined;
                    next(true);
                }
            }catch(e){
                _this.lastSuccData = undefined;
                _this.lastFailData = e;
                next(false);
            }
        }
        next(prevActionSucc);
    }
};

module.exports = Promise;