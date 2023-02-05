import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { getI18nContextFromRequest } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    async catch(exception: HttpException, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const request = context.getRequest<Request>();
        const response = context.getResponse<Response>();
        const i18n = getI18nContextFromRequest(request);
        if (exception.getStatus() === 400) response.send(exception.getResponse());
        const statusCode =
            exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception?.message
            ? await i18n.translate(`translation.${exception.message}`, {
                  lang: i18n.lang,
              })
            : 'Internal server error';
        response.status(statusCode).json({
            statusCode,
            message,
        });
    }
}
