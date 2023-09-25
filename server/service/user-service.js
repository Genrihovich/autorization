const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');

class UserService {
    async register(email, password) {

        //Убеждаемся что в БД не такого емейла, если есть то пробрасываем ошибку, если условие не выполнилось то создаем пользователя и записываем в БД
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            throw new Error(`Пользователь с почтовым адресом ${email} уже существует`);
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const user = await UserModel.create({ email, password: hashPassword });

    }


}

module.exports = new UserService();