const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs");
const auth = require("../middleware/auth");

router.get("/", auth, jobsController.listJobs);
router.get("/new", auth, jobsController.newJobForm);
router.post("/", auth, jobsController.createJob);
router.get("/edit/:id", auth, jobsController.editJobForm);
router.post("/update/:id", auth, jobsController.updateJob);
router.post("/delete/:id", auth, jobsController.deleteJob);

module.exports = router;
