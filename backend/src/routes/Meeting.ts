import { Request, Response, NextFunction, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { Models } from '../models';
import { ModelType } from '../models/Item';

const router = Router();

/******************************************************************************
 *                      Endpoint - "/api/meeting/"
 ******************************************************************************/

/**
 * Get all the meetings and their users.
 * 
 * @returns Array<Meeting>
 */
router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .find({
            $or: [
                { type: ModelType.MEETING },
                { type: ModelType.PENDING }
            ]
        })
        .select('-__v')
        .sort({ 'data.startDateTime': 1 })
        .then(documents => {
            res
                .status(OK)
                .json(documents);
        })
        .catch(err => next(err));
});

/**
 * Get specific meeting (could also be a pending one without mined tx) matching a unique id.
 * 
 * @params  id          The id to match with.
 * 
 * @returns Meeting
 */
router.get('/id/:id', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .findOne({
            $and: [
                { _id: req.params.id },
                {
                    $or: [
                        { type: ModelType.MEETING },
                        { type: ModelType.PENDING }
                    ]
                }
            ]
        })
        .select('-__v')
        .then(document => {
            res
                .status(OK)
                .json(document);
        })
        .catch(err => next(err));
});

/**
 * Create new meeting with empty meetingAddress.
 * 
 * @params  Meeting     Value of the model.
 * 
 * @returns Meeting
 */
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .create(req.body)
        .then((document: any) => {

            if (document?.data?.parent) {
                Models.Item
                    .updateOne(
                        { _id: document.data.parent, type: ModelType.MEETING },
                        { $set: { 'data.child': document._id } },
                        { safe: true }
                    )
                    .then(parent => {
                        res
                            .status(CREATED)
                            .json(document);
                    })
                    .catch(err => next(err));
            } else {
                res
                    .status(CREATED)
                    .json(document);
            }

        })
        .catch(err => next(err));
});

/**
 * Update meetingAddress once given meeting (txHash) is deployed (mined).
 * The primary key needs to change from tx hash to contract address.
 * However, since we're not allowed to update _id field, we're duplicating the
 * original document with new _id and delete the original one.
 * 
 * @params  txHash          The tx hash to look for.
 * @params  meetingAddress  The contract address to save.
 * 
 * @returns Meeting
 */
router.put('/update', async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);

    Models.Item
        .findById(req.body['txHash'])
        .then((original: any) => {
            const result = original;
            result.isNew = true;
            result._id = req.body['meetingAddress'];
            result.type = ModelType.MEETING;
            result
                .save()
                .then((document: any) => {
                    Models.Item
                        .updateOne(
                            { _id: document.data.parent, type: ModelType.MEETING },
                            { $set: { 'data.child': document._id } },
                            { safe: true }
                        )
                        .then(parent => {

                            Models.Item
                                .findByIdAndDelete(req.body['txHash'])
                                .then((oldDoc: any) => {
                                    res
                                        .status(CREATED)
                                        .json(result);
                                })
                                .catch(err => next(err));

                        })
                        .catch(err => next(err));
                })
                .catch((err: any) => next(err));
        })
        .catch(err => next(err));
});

/**
 * Update RSVP lists by adding new entry cross-mutually over two documents.
 * 
 * @params  meetingAddress  The _id to look for.
 * @params  userAddress     The user's address to look for.
 * 
 * @returns Meeting
 */
router.put('/rsvp/add', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body['meetingAddress'], type: ModelType.MEETING },
            {
                $push: { 'rsvp': req.body['userAddress'] },
                $pull: { 'cancel': req.body['userAddress'] },
            },
            { safe: true, upsert: true }
        )
        .then(meeting => {
            Models.Item
                .updateOne(
                    { _id: req.body['userAddress'], type: ModelType.USER },
                    {
                        $push: { 'rsvp': req.body['meetingAddress'] },
                        $pull: { 'cancel': req.body['meetingAddress'] },
                    },
                    { safe: true, upsert: true }
                )
                .then(user => {
                    res
                        .status(OK)
                        .json(meeting);
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

/**
 * Update RSVP lists by removing existing entry cross-mutually over two documents.
 * 
 * @params  meetingAddress  The _id to look for.
 * @params  userAddress     The user's address to look for.
 * 
 * @returns Meeting
 */
router.put('/rsvp/cancel', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body['meetingAddress'], type: ModelType.MEETING },
            {
                $push: { 'cancel': req.body['userAddress'] },
                $pull: { 'rsvp': req.body['userAddress'] },
            },
            { safe: true, upsert: true }
        )
        .then(meeting => {
            Models.Item
                .updateOne(
                    { _id: req.body['userAddress'], type: ModelType.USER },
                    {
                        $push: { 'cancel': req.body['meetingAddress'] },
                        $pull: { 'rsvp': req.body['meetingAddress'] }
                    },
                    { safe: true, upsert: true }
                )
                .then(user => {
                    res
                        .status(OK)
                        .json(meeting);
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

/**
 * Update status of the meeting (isStarted).
 * 
 * @params  meetingAddress  The _id to look for.
 * 
 * @returns Meeting
 */
router.put('/start', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body['meetingAddress'], type: ModelType.MEETING },
            { $set: { 'data.isStarted': true } },
            { safe: true, upsert: true }
        )
        .then(meeting => {
            res
                .status(OK)
                .json(meeting);
        })
        .catch(err => next(err));
});

/**
 * Update status of the meeting (isEnded).
 * 
 * @params  meetingAddress  The _id to look for.
 * 
 * @returns Meeting
 */
router.put('/end', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body['meetingAddress'], type: ModelType.MEETING },
            { $set: { 'data.isEnded': true } },
            { safe: true, upsert: true }
        )
        .then(meeting => {
            res
                .status(OK)
                .json(meeting);
        })
        .catch(err => next(err));
});

/**
 * Update status of the meeting (isCancelled).
 * 
 * @params  meetingAddress  The _id to look for.
 * 
 * @returns Meeting
 */
router.put('/cancel', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body['meetingAddress'], type: ModelType.MEETING },
            { $set: { 'data.isCancelled': true } },
            { safe: true, upsert: true }
        )
        .then(meeting => {
            res
                .status(OK)
                .json(meeting);
        })
        .catch(err => next(err));
});

/**
 * Update rsvp & attend lists both for provided meeting as well as the participant.
 * 
 * @params  meetingAddress  The meeting's address to look for.
 * @params  userAddress     The user's address to look for.
 * 
 * @returns Meeting
 */
router.put('/attendance', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body['meetingAddress'], type: ModelType.MEETING },
            {
                $push: { 'attend': req.body['userAddress'] },
                $pull: { 'rsvp': req.body['userAddress'] }
            },
            { safe: true, upsert: true }
        )
        .then(meeting => {
            Models.Item
                .updateOne(
                    { _id: req.body['userAddress'], type: ModelType.USER },
                    {
                        $push: { 'attend': req.body['meetingAddress'] },
                        $pull: { 'rsvp': req.body['meetingAddress'] }
                    },
                    { safe: true, upsert: true }
                )
                .then(user => {
                    res
                        .status(OK)
                        .json(meeting);
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

/**
 * Add participant's feedback to a specific meeting (and user's profile).
 * 
 * @params  Feedback     Value of the feedback (meetingAddress, userAddress, rating, comment, uploadedImages, uploadedVideos).
 * 
 * @returns Meeting
 */
router.put('/feedback', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body.feedback['meetingAddress'], type: ModelType.MEETING },
            {
                $push: { 'data.feedback': req.body['feedback'] },
            },
            { safe: true }
        )
        .then(meeting => {
            Models.Item
                .updateOne(
                    { _id: req.body.feedback['userAddress'], type: ModelType.USER },
                    {
                        $push: { 'data.feedback': req.body['feedback'] },
                    },
                    { safe: true }
                )
                .then(user => {
                    res
                        .status(OK)
                        .json(meeting);
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

/**
 * Update rsvp, attend & withdraw lists both for provided meeting as well as the participant.
 * 
 * @params  meetingAddress  The meeting's address to look for.
 * @params  userAddress     The user's address to look for.
 * 
 * @returns Meeting
 */
router.put('/withdraw', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body['meetingAddress'], type: ModelType.MEETING },
            {
                $push: { 'withdraw': req.body['userAddress'] },
                $pull: {
                    'rsvp': req.body['userAddress'],
                    'attend': req.body['userAddress']
                }
            },
            { safe: true, upsert: true }
        )
        .then(meeting => {
            Models.Item
                .updateOne(
                    { _id: req.body['userAddress'], type: ModelType.USER },
                    {
                        $push: { 'withdraw': req.body['meetingAddress'] },
                        $pull: {
                            'rsvp': req.body['meetingAddress'],
                            'attend': req.body['meetingAddress']
                        }
                    },
                    { safe: true, upsert: true }
                )
                .then(user => {
                    res
                        .status(OK)
                        .json(meeting);
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

/**
 * Update pause meeting
 * 
 * @params  meetingAddress  The _id to look for.
 * 
 * @returns Meeting
 */
router.put('/pause', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body['meetingAddress'], type: ModelType.MEETING },
            { $set: { 'data.isPaused': true } },
            { safe: true, upsert: true }
        )
        .then(meeting => {
            res
                .status(OK)
                .json(meeting);
        })
        .catch(err => next(err));
});

export default router;
