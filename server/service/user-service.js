const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exeptions/api-error');
const userModel = require('../models/user-model');

class UserService {
    async register(email, password) {

        //Убеждаемся что в БД не такого емейла, если есть то пробрасываем ошибку, если условие не выполнилось то создаем пользователя и записываем в БД
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            //   throw new Error(`Пользователь с почтовым адресом ${email} уже существует`);
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }

        const hashPassword = await bcrypt.hash(password, 3);

        //генерим ссылку для активации пользователя
        const activationLink = uuid.v4();

        const user = await UserModel.create({ email, password: hashPassword, activationLink });
        // после создания пользователя отправляем ему сообщение на почту
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        //на основании модели создаем дто - чтоб выкинуть не нужные поля, как параметр передаем модель
        const userDto = new UserDto(user); // id, email, isActivated

        //генерим токены и помещаем их в обьект
        const tokens = tokenService.generateTokens({ ...userDto });

        //по плану надо сохранить рефрештокен в базу данных
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }

    }

    async activate(activationLink) {
        //Ищем пользователя по ссылке activationLink
        const user = await UserModel.findOne({ activationLink });

        //Если пользователя нет то пробрасываем ошибку, которую обработаем в контроллере
        if (!user) {
            // throw new Error('Не корректная ссылка активации');
            throw ApiError.BadRequest('Не корректная ссылка активации');
        }
        //Если пользователь есть 
        user.isActivated = true;

        //сохраняем обновленного пользователя в БД
        await user.save();
        //теперь пользователь активирован и его почта подтверждена
    }

    async login(email, password) {
        //ищем пользователя с данным мылом, убеждаемся что он зарегистрирован
        const user = await userModel.findOne({ email });
        if (!user) { //если не найден то пробрасываем ошибку
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }
        //если найден надо сравнить пароли (1- сам пароль 2- из базы данных)
        const isPassEquals = await bcrypt.compare(password, user.password);
        //Если пароли не равны то
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        // Генерируем Dto из модели выбрасываем все не нужное
        const userDto = new UserDto(user);
        //Генерим пару токенов
        const tokens = tokenService.generateTokens({ ...userDto });
        //сохраняем рефрештокен в базу данных
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }

    async logout(refreshToken) {
        //удалить рефрештокен из БД
        const token = tokenService.removeToken(refreshToken);
        return token;
    }

}

module.exports = new UserService();