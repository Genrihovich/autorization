const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const userDto = require('../dtos/user-dto');

class UserService {
    async register(email, password) {

        //Убеждаемся что в БД не такого емейла, если есть то пробрасываем ошибку, если условие не выполнилось то создаем пользователя и записываем в БД
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            throw new Error(`Пользователь с почтовым адресом ${email} уже существует`);
        }

        const hashPassword = await bcrypt.hash(password, 3);

        //генерим ссылку для активации пользователя
        const activationLink = uuid.v4();

        const user = await UserModel.create({ email, password: hashPassword, activationLink });
        // после создания пользователя отправляем ему сообщение
        await mailService.sendActivationMail(email, activationLink);

        //на основании модели создаем дто - чтоб выкинуть не нужные поля, как параметр передаем модель
        const userDto = new userDto(user); // id, email, isActivated

        //генерим токены и помещаем их в обьект
        const tokens = tokenService.generateTokens({ ...userDto });

        //по плану надо сохранить рефрештокен в базу данных
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }

    }


}

module.exports = new UserService();