const express = require("express");
const app = express();
const port = 4000;

app.get("/api/count", (req, res) => {
  res.json({
    count: "yes"
  });
});
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
