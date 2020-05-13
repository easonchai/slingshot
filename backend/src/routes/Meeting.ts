import { Request, Response, NextFunction, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { Models } from '../models'

const router = Router();

/******************************************************************************
 *                      Endpoint - "/api/meeting/"
 ******************************************************************************/

router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
    Models.Meeting
        .find()
        .populate('users')
        .then(document => {
            res
                .status(OK)
                .json(document);
        })
        .catch(err => next(err));
});

/**
 * Create new meeting with empty meetingAddress.
 */
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body.users);

    Models.Meeting
        .create(req.body)
        .then(document => {
            res
                .status(CREATED)
                .json(document);
        })
        .catch(err => next(err));
});

/**
 * Update meetingAddress once given meeting (txHash) is deployed (mined).
 */
router.put('/update', async (req: Request, res: Response, next: NextFunction) => {
    Models.Meeting
        .updateOne(
            { txHash: req.body['txHash'] },
            { meetingAddress: req.body['meetingAddress'] }
        )
        .then(document => {
            res
                .status(OK)
                .json(req.body)
        })
        .catch(err => next(err));
});

/**
 * Update RSVP list of a given meetingAddress.
 */
router.put('/rsvp', async (req: Request, res: Response, next: NextFunction) => {
    Models.Meeting
        .updateOne(
            { txHash: req.body['meetingAddress'] },
            { $push: { "users": req.body['user'] } },
            { safe: true, upsert: true, new: true }
        )
        .then(document => {
            res
                .status(OK)
                .json(req.body)
        })
        .catch(err => next(err));
});

export default router;
