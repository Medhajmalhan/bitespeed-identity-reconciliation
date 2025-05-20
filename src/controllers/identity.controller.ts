import { Request, Response, NextFunction } from 'express';
import { processIdentity } from '../services/identity.service';

export const identifyContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      res.status(400).json({ error: 'Either email or phoneNumber is required.' });
      return;
    }

    const contact = await processIdentity(email, phoneNumber);

    res.status(200).json({ contact });
  } catch (error) {
    next(error);
  }
};
