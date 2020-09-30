import mongoose from 'mongoose';

export const ModelType = {
    USER: 'user',
    PENDING: 'pending',
    MEETING: 'meeting',
    CLUB: 'club',
};

const ProposalIdSchema = new mongoose.Schema({
    clubAddress: String,
    meetingAddress: String,
    index: Number
});

const ProposalSchema = new mongoose.Schema({
    created: Number,
    id: ProposalIdSchema,
    newAdmin: [String],
    oldAdmin: [String],
    votes: [String],
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
        proposals: [ProposalSchema],
        data: Object
    })
);
