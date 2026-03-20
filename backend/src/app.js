const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorMiddleware = require("./middleware/error.Middleware");

/** import the auth route file */
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const delegationRoutes = require("./routes/delegationRoutes");
const reportRoutes = require("./routes/reportRoutes");

/** create express */
const app = express();

//** apply helmet to all request */
app.use(helmet());

//** log requests  */ */
app.use(morgan("dev"));

/*parse request*/
app.use(express.json())

/** allowing request from frontend */
const allowedOrigins = [
  ...(process.env.CLIENT_URL || "").split(","),
  ...(process.env.FRONTEND_URL || "").split(","),
]
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      return callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);
//** test route */
app.get('/',(req,res)=>{
  
    res.json({message:"Management API running"})
})


//** route path */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/delegations", delegationRoutes);
app.use("/api/reports", reportRoutes);  


/** for unknow api request */
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});


app.use((err, req, res, next) => {

  console.error("Error:", err.message);

  res.status(err.status || 500).json({

    message: err.message || "Internal server error",
  });

});

// Attach  error handling middleware //
app.use(errorMiddleware);

module.exports = app;
