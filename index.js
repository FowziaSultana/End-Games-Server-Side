const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send(`Toy App is running `);
});

app.listen(port, () => {
  console.log(`Toy api is running on port: ${port}`);
});

const pass = process.env.DOC_PASS;
const user = process.env.DOC_USER;
const uri = `mongodb+srv://${user}:${pass}@cluster0.rbjgw7e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const toysCollection = client.db("toy-store-db").collection("toys");
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    //all toys read
    app.get("/alltoys", async (req, res) => {
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    // read toys accoring to search result
    app.get("/searchToys", async (req, res) => {
      let query = {};
      let mysearch;
      let result;
      if (req.query?.search) {
        mysearch = req.query?.search;
        result = await toysCollection
          .find({
            name: { $regex: ".*" + mysearch + ".*", $options: "i" },
          })
          .toArray();
        res.send(result);
      } else {
        result = await toysCollection.find().toArray();
        res.send(result);
      }
    });

    // read toys accoring to only email
    app.get("/toys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    // read toys accoring to only category
    app.get("/toysByCategory", async (req, res) => {
      let query = {};
      if (req.query?.cat) {
        query = { subCategory: req.query.cat };
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    // read and sort toys accoring to only email
    app.get("/sortToys", async (req, res) => {
      let result;
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      if (req.query?.sort) {
        const sortType = req.query.sort;
        if (sortType == "HighToLow") {
          const options = {
            // sort returned documents in ascending order by price (A->Z)
            sort: { price: -1 },
          };
          result = await toysCollection.find(query, options).toArray();
        } else if (sortType == "LowToHigh") {
          const options = {
            // sort returned documents in ascending order by price (A->Z)
            sort: { price: 1 },
          };
          result = await toysCollection.find(query, options).toArray();
        } else {
          result = await toysCollection.find(query).toArray();
        }
      }

      res.send(result);
    });

    //get toys by their id
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      // console.log(result);
      res.send(result);
    });

    //create a single toy
    app.post("/toys", async (req, res) => {
      const singleToy = req.body;
      //console.log(singleToy);
      const result = await toysCollection.insertOne(singleToy);
      res.send(result);
    });
    //delete a single toy
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    //update single toy
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const aToy = req.body;
      // console.log(aToy);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const name = aToy.name;
      const ratings = aToy.ratings;
      const price = aToy.price;
      const quantity = aToy.quantity;
      const subCategory = aToy.subCategory;
      const photo = aToy.photo;
      const details = aToy.details;
      const updateToy = {
        $set: {
          name: name,
          ratings: ratings,
          price: price,
          quantity: quantity,
          subCategory: subCategory,
          photo: photo,
          details: details,
        },
      };
      const result = await toysCollection.updateOne(filter, updateToy, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
