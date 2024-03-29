var createError = require("http-errors");
var express = require("express");
const cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// import compress from 'compression' // install
// import helmet from 'helmet' // install
require("dotenv").config();
const { default: mongoose } = require("mongoose");
const { mongoUri } = require("./common/config/config");

// route  paths
var indexRouter = require("./routes/index.routes");
var usersRouter = require("./routes/user/user.routes");
const authRouter = require("./routes/user/auth.routes");
const photoRouter = require("./routes/photos/photos.routes");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
// app.use(cors())
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your allowed origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(compress())
// secure apps by setting various HTTP headers
// app.use(helmet())
app.use(express.static(path.join(__dirname, "public")));

// database
const option = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose
  .connect(mongoUri, this.options) // emit options on host
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error(err));

mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

// mount routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

// api routes
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/photos", photoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
