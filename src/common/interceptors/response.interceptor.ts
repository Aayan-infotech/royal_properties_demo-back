import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data: any) => {
        const statusCode = response.statusCode ?? 200;

        // if controller returned { message, data }
        let message = 'Request successful';
        let payload: any = data;

        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;
          payload = 'data' in data ? data.data : data;
        }

        const apiResponse: ApiResponse = {
          status: statusCode,
          success: true,
          message,
          data: payload ?? null,
        };

        return apiResponse;
      }),
    );
  }
}
