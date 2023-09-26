const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {

    //генерация токена - payload - будем прятать в токен
    generateTokens(payload) {
        //access токен - 1-payload 2-secretkey 3-время жизни 30 мин
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken
        }
    }

    //сохранение токена в базу данных
    async saveToken(userId, refreshToken) {
        // сначала ищем такой токен в БД
        const tokenData = await tokenModel.findOne({ user: userId });
        //если мы нашли токен для этого юзера то мы перезаписываем рефрештокен
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            //вызываем save() чтобы refresh токен обновился
            return tokenData.save();
        }
        //если условие не выполнено - значит юзер логиниться первый раз
        const token = await tokenModel.create({ user: userId, refreshToken });
        return token;
    }

}

module.exports = new TokenService();