import mongoose from 'mongoose';

export const ModelType = {
    USER: 'user',
    MEETING: 'meeting',
    PENDING: 'pending'
};

export const Item = mongoose.model(
    "Item",
    new mongoose.Schema({
        _id: String,
        type: {
            type: String,
            enum: Object.values(ModelType)
        },
        data: Object,
        parent: String,
        child: String,
        cancel: [String],
        rsvp: [String],
        attend: [String],
        withdraw: [String]
    })
);
