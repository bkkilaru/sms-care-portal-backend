import {Request, Response, NextFunction} from 'express';
import {ResourceNotFoundError, ValidationError} from '../exceptions';

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
    if (error instanceof ResourceNotFoundError) {
        res.status(404).send({
            message: error.message
        });
    } else if (error instanceof ValidationError) {
        res.status(400);
        res.send({
            message: error.message
        });
    } else {
        res.status(500);
        res.send({
            message: error.message
        });
    }
} 