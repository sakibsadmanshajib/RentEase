import { Request, Response } from 'express';
import { AxiosResponse } from 'axios';

export function buildAuthHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {};

    if (req.headers.authorization) {
        headers.Authorization = req.headers.authorization as string;
    } else if (req.cookies?.accessToken) {
        headers.Authorization = `Bearer ${req.cookies.accessToken}`;
    }

    return headers;
}

export function forwardSetCookies(res: Response, upstream: AxiosResponse): void {
    const setCookie = upstream.headers['set-cookie'];
    if (!setCookie) {
        return;
    }

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    res.setHeader('Set-Cookie', cookies);
}

export function buildProxyHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...buildAuthHeaders(req),
    };

    if (req.headers.cookie) {
        headers.Cookie = req.headers.cookie;
    }

    return headers;
}
