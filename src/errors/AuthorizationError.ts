import IErrorWrapper from './IErrorWrapper';

// eslint-disable-next-line import/prefer-default-export
export class AuthorizationError extends Error implements IErrorWrapper {
    constructor(
        cause: string,
        public wrappedError?: Error,
    ) {
        super(cause);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}
