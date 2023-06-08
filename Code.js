const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.listen(port,()=>{
    console.log('Server listening at http://localhost:3000');
})

app.use(express.json());


//Data from MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://CHUA0528:CCF12345@chua.ch7khae.mongodb.net/";

//Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let db= client.db("CHUA").collection("Lab3")

async function Register(ID, newusername,newpassword)
{
        //To do:Check if username is already taken
        const MongData = await db.find({"username":newusername}).next(); //find the username in the database
        let found=MongData
        if (found)
        {
            console.log(found)
            return "Username already taken"
        }

        //To do:Hash the password
        const salt= await bcrypt.genSalt(saltRounds)
        const hashh = await bcrypt.hash(newpassword,salt)
        
        const Insert = await db.insertOne({_id:ID,username : newusername,password : hashh}) 
        //Insert the new username and hashed password into the database collection
        console.log(Insert)
        await client.close();
        return ("Register successfully")
        //if the username is accepted and there is no error in hashing, return "Register successfully
}

//function to login
async function Login(username,password){

    //Search for the username in the users array
    const user = await db.find({"username":username}).next();
    console.log(user)
    await client.close();
    if(user)
    {
         //if the username is found, compare the password with the hashed password in the users array
        const match = await bcrypt.compare(password,user.password);   
        console.log(match)
        if(match)
        {
            return `${user.username}\nLogin successfully`
        }
        else
        {
            return "Wrong password"
        }
    }
    return "Username not found"
}

//function to update password
async function Update(ID,newusername,newpassword)
{
    
    await client.connect()
    var myquery = { _id: ID}
    const salt= await bcrypt.genSalt(saltRounds)
    const hashh = await bcrypt.hash(newpassword,salt)
    var newvalues = { $set: {username: newusername, password: hashh } };
   

    const result=await db.updateOne(myquery, newvalues)
    if(result)
    {
        await client.close();
        console.log(result)
        return "Update successfully"
    }
    else
    {
        await client.close();
        return "Update failed"
    }
}

//function to delete user
async function Delete(ID)
{
    await client.connect()
    var myquery = { _id: ID}
    const result=await db.deleteOne(myquery)
    if(result)
    {
        await client.close();
        console.log(ID + " is deleted successfully")
        return "Delete successfully"
    }
    else
    {
        await client.close();
        return "Delete failed"
    }
}




//user interface
app.post('/Register', async (req, res) => {
    let data=req.body;
   // data = await register(data.username,data.password)
    //console.log(data)
    res.send(await Register(data._id,data.username,data.password));
});

app.get ('/Login',async(req,res)=>{
    let data=req.body;
    
    res.send( await Login(data.username,data.password));
    
})

app.patch('/Update',async(req,res)=>{
    let data=req.body;
    const result=await Update(data._id,data.username,data.password)
    //console.log(result)
    res.send(result);
})

app.delete('/Delete',async(req,res)=>{
    let data=req.body;
    res.send(await Delete(data._id));
})
