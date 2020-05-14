import { Request, Response, NextFunction, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { Models } from '../models'

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
    Models.Meeting
        .find()
        .then(document => {
            res
                .status(OK)
                .json(document);
        })
        .catch(err => next(err));
});

/**
 * Get specific meeting (and its users) matching a tx hash.
 * 
 * @params  txHash          The tx hash to match with.
 * 
 * @returns Meeting
 */
router.get('/tx/:txHash', async (req: Request, res: Response, next: NextFunction) => {
     Models.Meeting
         .findOne({ txHash: req.params.txHash })
         .then(document => {
             res
                 .status(OK)
                 .json(document);
         })
         .catch(err => next(err));
});

/**
 * Get specific meeting (and its users) matching a contract address.
 * 
 * @params  meetingAddress  The contract address to match with.
 * 
 * @returns Meeting
 */
router.get('/contract/:meetingAddress', async (req: Request, res: Response, next: NextFunction) => {
     Models.Meeting
         .findOne({ meetingAddress: req.params.meetingAddress })
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
 * 
 * @params  txHash          The tx hash to look for.
 * @params  meetingAddress  The contract address to save.
 * 
 * @returns Meeting
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
                .json(document)
        })
        .catch(err => next(err));
});

/**
 * Update RSVP list of a given meetingAddress.
 * 
 * @params  txHash  The tx hash to look for.
 * @params  User    The value of the user model.
 * 
 * @returns Meeting
 */
router.put('/rsvp', async (req: Request, res: Response, next: NextFunction) => {
    Models.Meeting
        .updateOne(
            { meetingAddress: req.body['meetingAddress'] },
            { $push: { "users": req.body['userAddress'] } },
            { safe: true, upsert: true }
        )
        .then(document => {
            res
                .status(OK)
                .json(document)
        })
        .catch(err => next(err));
});

export default router;
