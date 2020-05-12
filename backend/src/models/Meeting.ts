import mongoose from 'mongoose';

export const Meeting = mongoose.model(
    "Meeting",
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
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    })
);
