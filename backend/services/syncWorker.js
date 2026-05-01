const { getJob } = require('./syncQueue');
const {
  syncCreateStudent,
  syncUpdateStudent,
  syncLeaveStudent,
  syncCreateTeacher,
  syncCreateBatch,
  syncAssignTeacher
} = require('./sheetSync');

async function processJob(job) {
  try {
    switch (job.type) {
      case "CREATE_STUDENT":
        await syncCreateStudent(job.userId, job.data);
        break;

      case "UPDATE_STUDENT":
        await syncUpdateStudent(job.userId, job.data);
        break;

      case "LEAVE_STUDENT":
        await syncLeaveStudent(job.userId, job.data);
        break;

      case "CREATE_TEACHER":
        await syncCreateTeacher(job.userId, job.data);
        break;

      case "CREATE_BATCH":
        await syncCreateBatch(job.userId, job.data);
        break;

      case "ASSIGN_TEACHER":
        await syncAssignTeacher(job.userId, job.data);
        break;

      case "REMOVE_TEACHER":
        await syncRemoveTeacher(job.userId, job.data);
        break;

      default:
        console.log("Unknown job:", job.type);
    }
  } catch (err) {
    console.error("Sync failed:", err.message);

    setTimeout(() => {
      require('./syncQueue').pushJob(job);
    }, 5000);
  }
}

function startWorker() {
  console.log(" Sync Worker Started");

  setInterval(async () => {
    const job = getJob();

    if (job) {
      await processJob(job);
    }
  }, 1000); // runs every second
}

module.exports = { startWorker };