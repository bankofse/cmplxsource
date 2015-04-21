"use strict";
module.exports = function (generator) {
    return new Promise((accept, reject) => {
        var onResult = (lastResult) => {
            let r = generator.next(lastResult);
            var value = r.value;
            let done = r.done;
            if (!done) {
                value.then(onResult, reject);
            } else {
              accept(value);  
            } 
        }
        onResult();
    });
};
