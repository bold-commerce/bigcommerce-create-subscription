import { ErrorRequestHandler } from 'express';
import { v4 } from 'uuid';

import {
    AuthorizationError,
    ConfigurationError,
    DependencyError,
    InvalidInputError,
    ResourceNotFoundError,
} from './errors';

interface FormattedError {
    loglevel: 'debug' | 'warn' | 'error'
    message: string
    status: number
    error: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

const mapError = (err: unknown): FormattedError => {
    if (err instanceof AuthorizationError) {
        return {
            loglevel: 'debug',
            message: err.message,
            status: 403,
            error: err,
        };
    }

    if (err instanceof InvalidInputError) {
        return {
            loglevel: 'debug',
            message: err.message,
            status: 422,
            error: err,
        };
    }

    if (err instanceof ResourceNotFoundError) {
        return {
            loglevel: 'debug',
            message: err.message,
            status: 404,
            error: err,
        };
    }

    if (err instanceof ConfigurationError || err instanceof DependencyError) {
        return {
            loglevel: 'error',
            message: 'Internal server error',
            status: 500,
            error: err,
        };
    }

    return {
        loglevel: 'error',
        message: 'Internal server error',
        status: 500,
        error: err,
    };
};

const errorHandler: ErrorRequestHandler = (err, _, res) => {
    const {
        status,
        message,
        error,
        loglevel,
    } = mapError(err);

    const errorId = v4();
    const time = new Date().toISOString();

    res.status(status).send({
        status,
        errorId,
        error: message,
    });

    if (loglevel === 'debug') {
        console.log({ time, errorId, error }); // eslint-disable-line no-console
    } else if (loglevel === 'warn') {
        console.warn({ time, errorId, error }); // eslint-disable-line no-console
    } else if (loglevel === 'error') {
        console.error({ time, errorId, error }); // eslint-disable-line no-console
    }
};

export default errorHandler;
