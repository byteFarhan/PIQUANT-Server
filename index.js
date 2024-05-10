const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("PIQUANT Server is running...");
});

app.listen(port, () => {
  console.log(`PIQUANT Server is running on port ${port}`);
});
