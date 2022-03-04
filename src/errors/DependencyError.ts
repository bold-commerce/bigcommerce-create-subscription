import IErrorWrapper from './IErrorWrapper';

// eslint-disable-next-line import/prefer-default-export
export class DependencyError extends Error implements IErrorWrapper {
    constructor(
        dependency: string,
        public wrappedError?: Error,
    ) {
        super(`Failed to access underlying dependency: ${dependency}`);
        Object.setPrototypeOf(this, DependencyError.prototype);
    }
}
