const express = require("express");
const { connectToDB } = require("./db");
const { userRouter } = require("./routes/userRoutes");
const { dealsRouter } = require("./routes/dealsRouters");
const { auth } = require('./middleware/auth.middleware');
const { apiLimiter } = require("./middleware/rateLimiter.middleware");
const swaggerJSdoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());
// config
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Deals App",
            version: "1.0.0"
        },
        servers: [
            {
                url: "https://dealsapp.onrender.com"
            }
        ]
    },
    apis: ["./routes/*.js"]
}

// openAPI
const openAPIsec = swaggerJSdoc(options);

app.use("/", swaggerUI.serve, swaggerUI.setup(openAPIsec));
app.use('/user', userRouter);
// app.use("/deals", apiLimiter);
app.use('/deals', dealsRouter);




app.listen(8080, async () => {
    try {
        await connectToDB;
        console.log("server is running");
    } catch (err) {
        console.error(err);
    }
})

