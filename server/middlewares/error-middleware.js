// этот мидлваер будет отвечать за обработку ошибок
const ApiError = require('../exeptions/api-error');
// первым параметром принимает саму ошибку
module.exports = function (err, req, res, next) {
    console.log(err);
    //если ошибка является инстансом этого класса. то тогда сразу отправляем ответ на клиент
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message, errors: err.errors });
    }
    // если мы не попали в иф - то ошибку мы не предусмотрели пошло что-то не поплану - серверная ошибка
    return res.status(500).json({ message: 'Не предвиденная ошибка' })
}