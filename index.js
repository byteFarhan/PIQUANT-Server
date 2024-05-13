const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// const origin = ["http://localhost:5173/"];
//Middlewares
const origin = "http://localhost:5173";
// app.use(cors({
//   origin: origin,
//   methods: ["GET", "POST", "PUT", "DELETE"], // Allow additional methods if needed
//   allowedHeaders: ["Content-Type", "Authorization", "X-My-Custom-Header"], // Allow custom headers
// }));
app.use(cors({ origin: origin, credentials: true }));
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

const foods_collection = client.db("PIQUANT-B9A11").collection("foods");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // GET :: get all foods from foods collection in database
    app.get("/foods", async (req, res) => {
      const result = await foods_collection.find().toArray();
      res.send(result);
    });
    // GET :: get top 6 foods from foods collection in database
    app.get("/top-foods", async (req, res) => {
      let query = {};
      const filter = { numberOfPurchases: -1 };
      const options = {
        projection: {
          _id: 1,
          foodName: 1,
          foodImage: 1,
          description: 1,
          postedDate: 1,
          price: 1,
        },
      };
      const result = await foods_collection
        .find(query, options)
        .sort(filter)
        .limit(6)
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("PIQUANT Server is running...");
});

app.listen(port, () => {
  console.log(`PIQUANT Server is running on port ${port}`);
});
