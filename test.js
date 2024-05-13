const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//Middlewares
app.use(cors());
app.use(express.json());

// const uri = `mongodb://localhost:27017`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jr4kdoi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// jasim vai gave me this code
const dbConnect = async () => {
  try {
    client.connect();
    console.log("DB Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();
//All Database collections
const foods_collection = client.db("PIQUANT-B9A11").collection("foods");

app.get("/", (req, res) => {
  res.send("PIQUANT Server is running...");
});

app.get("/foods", async (req, res) => {
  const result = await foods_collection.find().toArray();
  res.send(result);
});
app.listen(port, () => {
  console.log(`PIQUANT Server is running on port ${port}`);
});
