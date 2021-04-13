function Promise(executor) {
    const self = this;
    this.status = 'pending';
    this.value = null;
    this.reason = null;
    this.onfulfilledArray = [];
    this.onrejectedArray = [];

    // 因为resolve、reject可能在不确定环境下调用
    // 使用箭头函数保证this执行的正确性
    const resolve = resolve => {
        if (value instanceof Promise) {
            return value.then(resolve, reject);
        }
        // 不建议使用setTimeout，因为需要保证promise属于微任务，可以使用MutationObserver模拟promise
        setTimeout(() => {
            if (this.status === "pending") {
                this.value = value;
                this.status = "fulfilled";
                // 异步执行时候手动触发
                this.onfulfilledArray.forEach(func => func(value))
            }
        });
    }

    const reject = reason => {
        // 不建议使用setTimeout，因为需要保证promise属于微任务，可以使用MutationObserver模拟promise
        setTimeout(() => {
            if (this.status === "pending") {
                this.reason = reason;
                this.status = "rejected";
                // 异步执行时候手动触发
                this.onrejectedArray.forEach(func => func(reason));
            }
        });
    };
    try {
        executor(resolve, reject);
    } catch (error) {
        reject(error)
    }
}

Promise.prototype.then = function (onfulfilled, onrejected) {
    onfulfilled = typeof onfulfilled === "function" ? onfulfilled : (data) => data;
    onrejected = typeof onrejected === "function" ? onrejected :
        (error) => {
            throw error;
        };
    if (this.status === "fulfilled") {
        onfulfilled(this.value);
    }
    if (this.status === "rejected") {
        onrejected(this.reason);
    }

    // 支持executor内执行异步逻辑
    this.onfulfilledArray.push(onfulfilled);
    if (this.status === "pending") {
        this.onrejectedArray.push(onrejected);
    }
};

// test code

let p = new Promise((resolve, reject) => {
    resolve("data");
    // reject('reason')
    // setTimeout(() => {
    //   resolve("reason");
    // }, 2000);
});

p.then(
    (data) => console.log('1 ' + data),
    (reason) => console.log(reason)
);

p.then(
    (data) => console.log('2 ' + data),
    (reason) => console.log(reason)
);

// console.log("start");