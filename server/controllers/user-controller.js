const userService = require('../service/user-service');

class UserController {

    async registration(req, res, next) {
        try {
            //вытаскиваем из тела запроса мыло и пароль
            const { email, password } = req.body;
            // передаем данные в ф-цию регистрации внутри сервиса который мы реализовали
            const userData = await userService.register(email, password);
            //эта ф-ция возвращает токены и инфу пользователя

            //сохраняем в куки токен рефреш (httpOnly: true - чтобы нельзя было получать и изменять куку внутри браузера)
            res.coockie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            return res.json(userData);
        } catch (e) {
            console.log(e);
        }
    }

    async login(req, res, next) {
        try {
        } catch (e) { }
    }

    async logout(req, res, next) {
        try {
        } catch (e) { }
    }

    async activate(req, res, next) {
        try {
        } catch (e) { }
    }

    async refresh(req, res, next) {
        try {
        } catch (e) { }
    }

    async getUsers(req, res, next) {
        try {
            res.json(["1234", "4321"]);
        } catch (e) { }
    }

}

module.exports = new UserController();