const ApiError = require('../exeptions/api-error');
const tokenService = require('../service/token-service');

module.exports = function (req, res, next) {
    try {
        const autorizationHeader = req.headers.autorization;

        if (!autorizationHeader) {
            return next(ApiError.UnAuthorizedError());
        }
        //по пробелу разбиваем строку на 2 части (1-Bearer 2- сам токен)
        const accessToken = autorizationHeader.split(' ')[1];
        //если токена нет
        if (!accessToken) {
            return next(ApiError.UnAuthorizedError());
        }

        // валидируем токен
        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnAuthorizedError());
        }
        //если все ок - то в поле юзер реквеста помещаем данные пользователя
        req.user = userData;
        next();   //передаем управление следующему мидлверу

    } catch (e) {
        return next(ApiError.UnAuthorizedError());
    }
}