const Job = require("../models/Job");

const listJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id }).lean();
  res.render("jobs", { jobs, csrfToken: req.csrfToken() });
};

const newJobForm = (req, res) => {
  res.render("job", { job: null, csrfToken: req.csrfToken() });
};

const createJob = async (req, res, next) => {
  try {
    const { company, position, status } = req.body;
    await Job.create({ company, position, status, createdBy: req.user._id });
    res.redirect("/jobs");
  } catch (err) {
    next(err);
  }
};

const editJobForm = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).lean();

    if (!job) {
      req.flash("error", "Job not found or not authorized.");
      return res.redirect("/jobs");
    }

    res.render("job", { job, csrfToken: req.csrfToken() });
  } catch (err) {
    next(err);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { company, position, status } = req.body;
    await Job.updateOne(
      { _id: req.params.id, createdBy: req.user._id },
      { company, position, status }
    );
    res.redirect("/jobs");
  } catch (err) {
    next(err);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    await Job.deleteOne({ _id: req.params.id, createdBy: req.user._id });
    res.redirect("/jobs");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listJobs,
  newJobForm,
  createJob,
  editJobForm,
  updateJob,
  deleteJob,
};
