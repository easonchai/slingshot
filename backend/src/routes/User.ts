import { Request, Response, NextFunction, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { Models } from '../models'

const router = Router();

/******************************************************************************
 *                      Endpoint - "/api/user/"
 ******************************************************************************/

router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
    Models.User
        .find()
        .then(document => {
            res
                .status(OK)
                .json(document);
        })
        .catch(err => next(err));
});

router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    Models.User
        .create(req.body)
        .then(document => {
            res
                .status(CREATED)
                .json(document);
        })
        .catch(err => next(err));
});

export default router;
