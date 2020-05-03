import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';


const router = Router();


/******************************************************************************
 *                      Get Welcome Message - "GET /api/welcome"
 ******************************************************************************/

router.get('/', async (req: Request, res: Response) => {
    return res.status(OK).json({msg:'welcome'});
});


/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
