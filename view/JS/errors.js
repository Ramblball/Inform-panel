class TVWebError extends Error {

    constructor(message) {
        super(message);
    }
}

class PageLoadError extends TVWebError {
    constructor(message) {
        super(message);
        this.name = 'PageLoadError';
    }
}

class RequestError extends TVWebError {
    constructor(message) {
        super(message);
        this.name = 'RequestError';
    }
}

class UnexpectedError extends TVWebError {
    constructor(message) {
        super(message);
        this.name = 'UnexpectedError';
    }
}

class StupidError extends TVWebError {
}

export {UnexpectedError, PageLoadError, RequestError}
