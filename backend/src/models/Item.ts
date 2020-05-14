import mongoose from 'mongoose';

const UserSchema =
    new mongoose.Schema({
        ethereumAddress: String,
        meetings: [ String ]
    });

const MeetingSchema =
    new mongoose.Schema({
        txHash: String,
        meetingAddress: String,
        name: String,
        location: String,
        description: String,
        startDateTime: Number,
        endDateTime: Number,
        stake: Number,
        maxParticipants: Number,
        registered: Number,
        prevStake: Number,
        payout: Number,
        attendanceCount: Number,
        isCancelled: Boolean,
        isStarted: Boolean,
        isEnded: Boolean,
        deployerContractAddress: String,
        organizerAddress: String,
        users: [ String ]
    });

export const Item = mongoose.model(
    "Item",
    new mongoose.Schema({
        type: String,
        user: UserSchema,
        meeting: MeetingSchema
    })
);