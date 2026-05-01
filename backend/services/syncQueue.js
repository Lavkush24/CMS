const queue = [];

function pushJob(job) {
  queue.push(job);
}

function getJob() {
  return queue.shift();
}

module.exports = {
  pushJob,
  getJob
};