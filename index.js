const express = require('express')
require('dotenv').config();
const cors = require('cors');
const app = express()
const port = 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("hireloop_db");
    const jobCollection = database.collection("jobs");
    const companyCollection = database.collection("companies");
    const usersCollection = database.collection("user");
    const applicationCollection = database.collection("applications");


    app.get("/api/users", async (req, res) => {
      const cursor =usersCollection.find().skip(2);
      const results = await cursor.toArray();
      res.send(results);
    })


    app.post("/api/jobs", async (req, res) => {
      const job = req.body;
      const newJob = {
        ...job,
        createAt: new Date()
      } 
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    })

    app.get("/api/jobs", async (req, res) => {
        const query = {};
        if (req.query.companyId) {
            query.companyId = req.query.companyId;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }

        const cursor = jobCollection.find(query);
        const results = await cursor.toArray();
        res.send(results);
    })

    app.get("/api/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    })


    //application related api
    app.post("/api/applications", async (req, res) => {
      const application = req.body;
      const newApplication = {
        ...application,
        createAt: new Date()
      }
      const result = await applicationCollection.insertOne(newApplication);
      res.send(result);
    })

    //company related apis
    app.post("/api/companies", async (req, res) => {
      const company = req.body;
      const newCompany = {
        ...company,
        createAt: new Date()
      }
      const result = await companyCollection.insertOne(company);
      res.send(result);
    })

    app.get("/api/my/companies", async (req, res) => {
      const query = {};
      if (req.query.recruiterId) {
          query.recruiterId = req.query.recruiterId;
      }
      const results = await companyCollection.findOne(query);
      console.log("my Company", results);
      res.send(results || {});
    });

    app.get("/api/companies", async (req, res) => {
      const cursor = companyCollection.find().skip(4);
      const results = await cursor.toArray();
      res.send(results);
    });

    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})