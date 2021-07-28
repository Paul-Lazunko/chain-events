function timeoutPromise(cb, timeout = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      cb();
      resolve();
    }, timeout);
  })
}

module.exports = { timeoutPromise }
