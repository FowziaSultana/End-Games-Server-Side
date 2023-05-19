const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.use(cors());

app.get("/", (req, res) => {
  const pass = process.env.DOC_PASS;
  res.send(`Toy App is running ${pass}`);
});

app.listen(port, () => {
  console.log(`Toy api is running on port: ${port}`);
});
