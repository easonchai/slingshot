import mongoose from 'mongoose';

export const ModelType = {
    USER: 'user',
    PENDING: 'pending',
    MEETING: 'meeting',
    CLUB: 'club',
};

export const Item = mongoose.model(
    "Item",
    new mongoose.Schema({
        _id: String,
        type: {
            type: String,
            enum: Object.values(ModelType)
        },
        admins: [String],
        proposals: Object,
        data: Object
    })
);
