module.exports = class UserDto {
    email;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.id = model._id; //Mongo по дефолту добавляет нижнее подчеркивание _id - чтобы обозначить что поле не изменяемое
        this.isActivated = model.isActivated;

    }
    //Dto - data transfer object
}