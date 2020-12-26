const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = process.env.port || 3000;
const apiRoutes = require("./routes");

app.use(express.json());
app.use(apiRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/meetingApi", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connectin error:"));
db.once("open", () => {
    console.log("Connected to mongodb");
    app.listen(port, () => {
        console.log("Serving on port 3000");
    });
});