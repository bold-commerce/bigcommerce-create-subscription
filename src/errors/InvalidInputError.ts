import IErrorWrapper from './IErrorWrapper';

// eslint-disable-next-line import/prefer-default-export
export class InvalidInputError extends Error implements IErrorWrapper {
    constructor(
        cause: string,
        public wrappedError?: Error,
    ) {
        super(cause);
        Object.setPrototypeOf(this, InvalidInputError.prototype);
    }
}
