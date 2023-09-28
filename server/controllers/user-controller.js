const userService = require('../service/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exeptions/api-error');

class UserController {

    async registration(req, res, next) {
        try {
            //валидация req
            const errors = validationResult(req);
            //Проверяем находиться ли что-то в errors, если не пусто то есть ошибка
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
            }
            //вытаскиваем из тела запроса мыло и пароль
            const { email, password } = req.body;
            // передаем данные в ф-цию регистрации внутри сервиса который мы реализовали
            const userData = await userService.register(email, password);
            //эта ф-ция возвращает токены и инфу пользователя

            //сохраняем в куки токен рефреш (httpOnly: true - чтобы нельзя было получать и изменять куку внутри браузера)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            return res.json(userData);
        } catch (e) {
            //  console.log(e);
            next(e);//вызывая некс с ошибкой мы попадаем в мидлваре который организовали для ошибки
        }
    }

    async login(req, res, next) {
        try {
            //вытаскиваем из тела запроса мыло и пароль
            const { email, password } = req.body;
            //вызываем из сервиса ф-цию логин
            const userData = await userService.login(email, password);
            //сохраняем рефреш токен в куки
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            return res.json(userData);

        } catch (e) { next(e); }
    }

    async logout(req, res, next) {
        try {
            //вытаскиваем из куки рефреш токен
            const { refreshToken } = req.cookies;
            //вызываем из сервиса ф-цию и передаем рефр токен
            const token = userService.logout(refreshToken);
            //удаляем саму куку с рефештокеном
            res.clearCookie('refreshToken');
            //после всего возвращаем ответ на клиент
            return res.json(token);
        } catch (e) { next(e); }
    }

    async activate(req, res, next) {
        try {
            //получаем из строки запроса ссылку активации
            const activationLink = req.params.link; //'/activate/:link'

            //console.log(activationLink);

            await userService.activate(activationLink);
            //После того как пользователь перешел по ссылке его надо редиректнуть на фронтенд
            return res.redirect(process.env.CLIENT_URL);

        } catch (e) {
            //  console.log(e);
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            //вытаскиваем из куки рефреш токен
            const { refreshToken } = req.cookies;

            const userData = await userService.refresh(refreshToken);
            //сохраняем рефреш токен в куки
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            return res.json(userData);

        } catch (e) { next(e); }
    }

    async getUsers(req, res, next) {
        try {
            //  res.json(["1234", "4321"]);
            const users = await userService.getAllUsers();
            return res.json(users)
        } catch (e) { next(e); }
    }

}

module.exports = new UserController();