const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// const origin = ["http://localhost:5173/"];
//Middlewares
const origin = ["http://localhost:5173", "https://piquant-b9a11.web.app"];
// const origin = "https://piquant-b9a11.web.app";
// const origin = "*";
// app.use(cors({
//   origin: origin,
//   methods: ["GET", "POST", "PUT", "DELETE"], // Allow additional methods if needed
//   allowedHeaders: ["Content-Type", "Authorization", "X-My-Custom-Header"], // Allow custom headers
// }));
app.use(
  cors({
    origin: origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
// app.use(cors());
app.use(express.json());
app.use(cookieParser());

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
const reviews_collection = client.db("PIQUANT-B9A11").collection("reviews");
const purchases_collection = client.db("PIQUANT-B9A11").collection("purchases");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // POST :: post method to set JWT  token in client side cookie
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ seccess: true });
    });

    // POST :: This method use for clear browser Cookie when user logout there account.
    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log(user);
      res.clearCookie("token", { maxAge: 0 }).send({ seccess: true });
    });

    // GET :: get all foods from foods collection in database
    app.get("/foods", async (req, res) => {
      let quary = {};
      if (req.query.searchFor) {
        // console.log(req.query.searchFor);
        quary = { foodName: { $regex: new RegExp(req.query.searchFor, "i") } };
      } else if (req.query.authorEmail) {
        // console.log(req.query.authorEmail);
        quary = { "author.authorEmail": req.query.authorEmail };
      }
      const result = await foods_collection.find(quary).toArray();
      res.send(result);
    });
    // GET :: get single food data from foods collection in database
    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foods_collection.findOne(query);
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
          numberOfPurchases: 1,
        },
      };
      const result = await foods_collection
        .find(query, options)
        .sort(filter)
        .limit(6)
        .toArray();
      res.send(result);
    });

    // POST :: add new food item into foods collection in database
    app.post("/foods", async (req, res) => {
      const theFood = req.body;
      console.log(theFood);
      const result = await foods_collection.insertOne(theFood);
      // console.log(result);
      res.send(result);
    });

    // PATCH :: update the 'numberOfPurchases' property of food items when a user purchases food.
    app.patch("/foods", async (req, res) => {
      const purchasesInfo = req.body;
      const { productId, purchasesQuantity } = purchasesInfo;
      // console.log(productId, purchasesQuantity);
      const filter = { _id: new ObjectId(productId) };
      const document = {
        $inc: { numberOfPurchases: purchasesQuantity },
      };
      const result = await foods_collection.updateOne(filter, document);
      res.send(result);
    });

    // PUT :: update single food data into foods collection in database
    app.put("/food/:id", async (req, res) => {
      const id = req.params.id;
      const getFood = req.body;
      const {
        foodImage,
        foodQuantity,
        foodCategory,
        foodName,
        availableQuantity,
        foodOrigin,
        description,
        price,
        rating,
      } = getFood;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedFood = {
        $set: {
          ...getFood,
          // foodName: foodName,
          // foodImage: foodImage,
          // foodCategory: foodCategory,
          // foodQuantity: foodQuantity,
          // availableQuantity: availableQuantity,
          // foodOrigin: foodOrigin,
          // description: description,
          // price: price,
          // rating: rating,
        },
      };
      const result = await foods_collection.updateOne(
        filter,
        updatedFood,
        options
      );
      res.send(result);
    });

    // DELETE :: delete single food data from foods collection in database
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await foods_collection.deleteOne(filter);
      res.send(result);
    });

    // GET :: get all riviews from review_gallary collection in database
    app.get("/reviews", async (req, res) => {
      const result = await reviews_collection.find().toArray();
      res.send(result);
    });

    // POST :: add new user review into review gallary collection in database
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      // console.log(newReview);
      const result = await reviews_collection.insertOne(newReview);
      res.send(result);
    });

    // POST :: add new item or food into purchases collection in database
    app.post("/purchases", async (req, res) => {
      const newPurchase = req.body;
      const result = await purchases_collection.insertOne(newPurchase);
      res.send(result);
    });

    // GET :: get all purchased foods from purchases collection in database
    app.get("/purchases", async (req, res) => {
      let query = {};
      if (req.query.userEmail) {
        query = { "buyerInfo.buyerEmail": req.query.userEmail };
      }
      const result = await purchases_collection.find(query).toArray();
      res.send(result);
    });

    // DELETE :: delete a single food from purchases food collection in database
    app.delete("/purchases/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await purchases_collection.deleteOne(quary);
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
