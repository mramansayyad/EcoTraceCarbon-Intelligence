import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      severity: res.statusCode >= 400 ? (res.statusCode >= 500 ? 'ERROR' : 'WARNING') : 'INFO',
      message: `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      httpRequest: {
        requestMethod: req.method,
        requestUrl: req.originalUrl,
        status: res.statusCode,
        userAgent: req.headers['user-agent'],
        remoteIp: req.ip,
        latency: `${duration / 1000}s`,
      },
    };

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${logEntry.severity}] ${logEntry.message}`);
    }
  });

  next();
}
