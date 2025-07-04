import { Request } from 'express';
import { IUser } from '../models/userSchema';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  file?: Express.Multer.File;
}

export interface CreateProfileRequestBody {
  firstname: string;
  lastname: string;
  contact: string;
  bio?: string;
  gender: 'male' | 'female' | 'other';
  currency?: string;
  location?: string;
  avatar?: File | string;
}
export interface UpdateProfileRequestBody {
  firstname?: string;
  lastname?: string;
  contact?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  currency?: string;
  location?: string;
  avatar?: File | string;
}
