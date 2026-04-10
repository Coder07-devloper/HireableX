const mongoose=require("mongoose") // we are requiring this package "mongoose" for connecting the express server with mongoDB database.

// function for connecting express server to MongoDB database.
async function connectToDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        })
        console.log("connected to DB")
    } catch(err){
        console.log(err)
        throw err
    }
}

module.exports = connectToDB 
