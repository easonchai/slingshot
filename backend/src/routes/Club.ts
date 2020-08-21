import { Request, Response, NextFunction, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { Models } from '../models';
import { ModelType } from '../models/Item';

const router = Router();

/******************************************************************************
 *                      Endpoint - "/api/club/"
 ******************************************************************************/

/**
 * Get all the unique club names.
 * 
 * @returns Array<String>
 */
router.get('/names', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .find({
            $or: [
                { type: ModelType.MEETING },
                { type: ModelType.PENDING }
            ]
        })
        .distinct('data.clubName')
        .then(documents => {
            res
                .status(OK)
                .json(documents);
        })
        .catch(err => next(err));
});


export default router;
