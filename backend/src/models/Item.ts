import mongoose from 'mongoose';

export const ModelType = {
    USER: 'user',
    PENDING: 'pending',
    MEETING: 'meeting',
    CLUB: 'club',
};

export const Proposal = new mongoose.Schema({
    created: Number,
    id: Number,
    newAdmin: [String],
    oldAdmin: [String],
    voted: Number,
    state: String
});

export const Item = mongoose.model(
    "Item",
    new mongoose.Schema({
        _id: String,
        type: {
            type: String,
            enum: Object.values(ModelType)
        },
        admins: [String],
        proposals: [Proposal],
        data: Object
    })
);
