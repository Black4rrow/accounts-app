import { Request, Response, NextFunction} from "express";

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                mail: string;
            }
        }
    }
}

export function authenticateToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({message: "Missing Authorization header"});
    }

    const token = authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({message: "Missing token"});
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: number;
            mail: string;
        };

        req.user = decoded;
        next()
    } catch (err) {
        return res.status(401).json({message: "Invalid or expired token"});
    }
}