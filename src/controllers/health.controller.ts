import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const healthController = {
  check: (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Server is healthy',
    });
  },
}; 