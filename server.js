require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOption");
const connectDB = require("./config/dbConnection");
const mongoose = require("mongoose");
const { connect } = require("http2");

const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

//Connect to MongoDB
connectDB();

//Log every request on server
app.use(logger);

//Cors makes our api public so anyone can request it's data.
//Now when we set cors options, we can specify who has the access to data. Wich is set in allowedOrigins
app.use(cors(corsOptions));

//Handle json
app.use(express.json());

app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));
app.use("/users", require("./routes/userRoutes"));
app.use("/notes", require("./routes/noteRoutes"));

//Handle 404
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

//Log any server error to logs/errorLogs.log
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
});

//Log the mongoDB erros in logs/mongoErrLog.log
mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
