
const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({

    // Item being claimed
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },

    // Student who submitted the claim
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Reason for claiming the item
    claimDescription: {
        type: String,
        required: true,
        trim: true
    },

    // Claim status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }

}, {
    timestamps: true
});

// Create Claim Model
const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
