require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const viewEngine = require("./config/viewEngine");
const initWebRoutes = require("./routes/web");

let app = express();

//config view engine
viewEngine(app);

//config body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//init web routes
initWebRoutes(app);

let port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});