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
        .find({ type: ModelType.CLUB })
        .distinct('data.name')
        .then(documents => {
            res
                .status(OK)
                .json(documents);
        })
        .catch(err => next(err));
});

/**
 * Get all the clubs.
 * 
 * @returns Array<Club>
 */
router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .find({ type: ModelType.CLUB })
        .select('-__v')
        .sort({ 'data.name': 1 })
        .then(documents => {
            res
                .status(OK)
                .json(documents);
        })
        .catch(err => next(err));
});

/**
 * Create new club with empty clubAddress.
 * 
 * @params  Club     Value of the club.
 * 
 * @returns Club
 */
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .create(req.body)
        .then((document: any) => {
            res
                .status(CREATED)
                .json(document);

        })
        .catch(err => next(err));
});

export default router;
