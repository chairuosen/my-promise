function Promise(gen) {
    var _this = this;
    this._isPromise = true;
    this.queue = [];
    setTimeout(function () {
        try{
            gen(function resolve(data) {
                _this._start(true,data);
            },function reject(data) {
                _this._start(false,data);
            });
        }catch(e){
            _this._start(false,data);
        }
    },0)
}

function isPromise(obj) {
    if(!obj)return false;
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
    _start:function (prevActionSucc,resData) {
        var _this = this;
        function next(prevActionSucc,resData) {
            var item = _this.queue.shift();
            if(!item) {
                if(prevActionSucc){
                    return;
                }else{
                    throw resData;
                }
            }
            var action = prevActionSucc ? item.callback : item.failback;
            if(!action){
                next(prevActionSucc,resData);
                return;
            }
            try{
                var res = action(resData);
                if(isPromise(res)){
                    res.then(function (data) {
                        next(true,data);
                    },function (err) {
                        next(false,err);
                    })
                }else{
                    next(true,res);
                }
            }catch(e){
                next(false,e);
            }
        }
        next(prevActionSucc,resData);
    }
};

module.exports = Promise;