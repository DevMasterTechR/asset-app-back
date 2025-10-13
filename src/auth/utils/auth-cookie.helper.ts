import { Response } from 'express';

export const setAuthCookie = (res: Response, token: string) => {
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:  7 * 60 * 1000, // 7 minutos
    });
};

export const clearAuthCookie = (res: Response) => {
    res.clearCookie('jwt');
};
