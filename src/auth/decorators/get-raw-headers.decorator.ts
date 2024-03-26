import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetRawHeaders = createParamDecorator(
    (data: string, context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        return req.rawHeaders
    }
)