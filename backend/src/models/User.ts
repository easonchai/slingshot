import mongoose from 'mongoose';

export const User = mongoose.model(
    "User",
    new mongoose.Schema({
        ethereumAddress: String,
        meetings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Meeting"
            }
        ]
    })
);
