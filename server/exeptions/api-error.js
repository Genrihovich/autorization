//класс обработки всех ошибок связанных с api

module.exports = class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors = []) {
        super(message); //вызываем родительский конструктор
        this.status = status;
        this.errors = errors;
    }

    static UnAuthorizedError() {
        return new ApiError(401, 'Пользователь не авторизован');
    }

    //Пользователь указал не корректные параметры, не прошел валидацию
    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }
}