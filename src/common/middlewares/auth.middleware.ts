import { BAD_REQUEST } from '../exceptions/HttpStatusCodes';
import { TokenPayload } from '../../interfaces/auth.interface';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { SECRET_KEY } from '@config';
import { HttpException } from '@/common/exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { UNAUTHORIZED } from '@/common/exceptions/HttpStatusCodes';

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const Authorization =
      req.cookies['Authorization'] ||
      (req.header('Authorization')
        ? req.header('Authorization').split('Bearer ')[1]
        : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = verify(
        Authorization,
        secretKey
      ) as TokenPayload;
      const userId = verificationResponse.userId;

      const users = new PrismaClient().user;
      const findUser = await users.findUnique({
        where: { id: Number(userId) },
      });

      if (findUser) {
        req.user = verificationResponse;
        next();
      } else {
        next(new HttpException(UNAUTHORIZED, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(UNAUTHORIZED, 'Unauthorized'));
    }
  } catch (error) {
    next(new HttpException(UNAUTHORIZED, 'Wrong authentication token'));
  }
};

export const attachUserToRequest = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const Authorization =
      req.cookies['Authorization'] ||
      (req.header('Authorization')
        ? req.header('Authorization').split('Bearer ')[1]
        : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = verify(
        Authorization,
        secretKey
      ) as TokenPayload;
      const userId = verificationResponse.userId;

      const users = new PrismaClient().user;
      const findUser = await users.findUnique({
        where: { id: Number(userId) },
      });

      if (findUser) {
        req.user = verificationResponse;
      }
    }
    next();
  } catch (error) {
    next;
  }
};