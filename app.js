const express = require("express");
require("express-async-errors");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");

const passport = require("passport");
const passportInit = require("./passport/passportInit");

const User = require("./models/User");
const storeLocals = require("./middleware/storeLocals");
const sessionRoutes = require("./routes/sessionRoutes");
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
const connectDB = require("./db/connect");

const jobs = require("./routes/jobs");

const app = express();
app.set("view engine", "ejs");

app.use(helmet());
app.use(xssClean());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});
store.on("error", console.error);

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(csrf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(storeLocals);

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", sessionRoutes);
app.use("/secretWord", auth, secretWordRouter);
app.use("/jobs", auth, jobs);

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.error(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
