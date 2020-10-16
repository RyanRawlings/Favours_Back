const mongoose = require("mongoose");
const FavourType = require("./FavourType");

const publicRequestSchema = new mongoose.Schema({    
    requestUser: { 
                    type: mongoose.Types.ObjectId,
                    required: true
                },
    owingUser: {
                    type: mongoose.Types.ObjectId,
                    required: false
                },
    create_time: { 
                    type: Date, 
                    default: Date.now 
                },
    title: { 
                    type: String,
                    required: true
                },
    description: {
                    type: String,
                    required: true
                },
    rewards: [{    
                    // item: { type: mongoose.Types.ObjectId },
                    item: String,
                    quantity: { type: Number },    
                    providedBy: { type: mongoose.Types.ObjectId },    
                    create_time: { type: Date, default: Date.now }    
             }],     
    completed : { 
                    type: Boolean,
                    required: true
                },
    proof: {
                type: Object,
                required: false,        
                uploaded: { type: Boolean },
                uploadImageKey: { type: String },
                snippet: { type: String },
                uploadedBy:  { type: Object }   
            }
    
    })

module.exports = mongoose.model("PublicRequests", publicRequestSchema, "publicRequests");