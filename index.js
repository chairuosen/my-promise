var MyPromise = require('./promise');


function test(Promise) {
    function timeout(n) {
        return new Promise(function (resolve,reject) {
            setTimeout(function () {
                resolve(2);
            },n);
        })
    }

    function asyncReject() {
        return new Promise(function (resolve,reject) {
            setTimeout(function () {
                reject('Async rejected');
            },100)
        })
    }
    function asyncReject2() {
        return new Promise(function (resolve,reject) {
            setTimeout(function () {
                throw 'WTF!!!';
            },100)
        })
    }

    function start() {
        (new Promise(function (resolve,reject) {
            resolve(1);
        })).then(function (data) {
            console.log(data);
            return timeout(1000);
        }).then(function (data) {
            console.log(data);
            throw new Error('Error 3')
        }).then(function () {
            console.log('shouldnt be here');
            return 4;
        }).then(function (data) {
            console.log(data);
        }).catch(function (err) {
            console.log('Error Catch: '+err);
            return 5;
        }).then(function () {
            console.log(5);
            return asyncReject();
        }).then(function () {
            console.log('shouldnt be here');
        },function (err) {
            console.log(err);
        });
    }

    start();
}

// test(Promise);
test(MyPromise);