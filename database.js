const mongoose = require('mongoose')
const connect = async () => {
    try {
        await mongoose.connect("mongodb+srv://userManagement:Pruthipruthi7@cluster0.ebsqkeh.mongodb.net/userManagement?retryWrites=true&w=majority");

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};
module.exports = connect;