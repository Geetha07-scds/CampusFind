
const mongoose = require('mongoose');

// Item Schema
const itemSchema = new mongoose.Schema({

    itemType: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },

    itemName: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    image: {
        type: String,
        default: ''
    },

    // Student who reported this item
    
reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},

// Item status
status: {
    type: String,
    enum: ['active', 'returned', 'resolved'],
    default: 'active'
}

}, {
    timestamps: true
});

// Create Model
const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
