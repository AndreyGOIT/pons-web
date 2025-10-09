import { Request } from 'express';

const req = {} as Request;
console.log(req.user?.id); // ← если нет ошибок, всё заработало