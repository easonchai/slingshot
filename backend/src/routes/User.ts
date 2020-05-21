import { Request, Response, NextFunction, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { Models } from '../models';
import { ModelType } from '../models/Item';

const router = Router();

/******************************************************************************
 *                      Endpoint - "/api/user/"
 ******************************************************************************/

router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .find({ type: ModelType.USER })
        .then(document => {
            res
                .status(OK)
                .json(document);
        })
        .catch(err => next(err));
});

/**
 * Get specific user matching a unique id or create a new one.
 * 
 * @params  id          The id to match with.
 * 
 * @returns User
 */
router.get('/id/:id', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .findOne({ _id: req.params.id, type: ModelType.USER })
        .select('-__v')
        .then(document => document || Models.Item.create({ _id: req.params.id, type: ModelType.USER }))
        .then(user => {
            res
                .status(OK)
                .json(user);
        })
        .catch(err => next(err));
});

router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .create(req.body)
        .then(document => {
            res
                .status(CREATED)
                .json(document);
        })
        .catch(err => next(err));
});

export default router;
