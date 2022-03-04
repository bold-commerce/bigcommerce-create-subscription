import IErrorWrapper from './IErrorWrapper';

// eslint-disable-next-line import/prefer-default-export
export class ResourceNotFoundError extends Error implements IErrorWrapper {
    constructor(
        cause: string,
        public wrappedError?: Error,
    ) {
        super(cause);
        Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
    }
}
