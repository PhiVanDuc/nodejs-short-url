const { List } = require('../models/index');
const { string } = require('yup');
const cryptoJS = require('crypto-js');
const shortid = require('shortid');
const QRCode = require('qrcode');

module.exports = {
    index: async (req, res) => {
        const lists = await List.findAll({
            order: [["id", "desc"]],
        });
        const origin_url = req.protocol + '://' + req.headers.host;

        const data = lists.map(list => {
            return list.dataValues;
        })

        const newLists = data.map(list => {
            if (!list.password) return list;

            const decryptedBytes = cryptoJS.AES.decrypt(list.password, 'secretKey');
            const password = decryptedBytes.toString(cryptoJS.enc.Utf8);

            return {
                ...list,
                password,
            }
        })

        return res.render('index.ejs', {
            lists: newLists,
            errors: req.errors,
            old: req.old,
            origin_url: origin_url,
        });
    },

    handleAdd: async (req, res, next) => {
        const { root_url, password, safe_redirect, custom_path } = req.body;

        const validateObj = {
            root_url: string().required("Yêu cầu cung cấp đường dẫn gốc!"),
        }

        if (custom_path) validateObj["custom_path"] = string().test('check-unique', 'ID tùy chỉnh đã tồn tại!', async (value) => {
            const item = await List.findOne({
                where: {
                    custom_path: value,
                }
            });

            let result = false;
            if (!item) result = true;

            return result;
        });

        const body = await req.validate(req.body, validateObj);

        if (body) {
            const addObj = {};

            if (root_url) addObj["root_url"] = root_url;
            if (password) addObj["password"] = cryptoJS.AES.encrypt(password, 'secretKey').toString();
            if (safe_redirect === "on") addObj["safe_redirect"] = true;
            if (custom_path) addObj["custom_path"] = custom_path;
            else addObj["custom_path"] = shortid.generate();

            try {
                await List.create({
                    ...addObj,
                    short_url: req.protocol + '://' + req.headers.host + '/' + addObj.custom_path,
                });
            }
            catch(error) {
                return next(error);
            }
        }

        return res.redirect("/");
    },

    edit: async (req, res) => {
        const lists = await List.findAll({
            order: [["id", "desc"]],
        });
        const { id } = req.params;

        const data = lists.map(list => {
            return list.dataValues;
        })

        const newLists = data.map(list => {
            if (!list.password) return list;

            const decryptedBytes = cryptoJS.AES.decrypt(list.password, 'secretKey');
            const password = decryptedBytes.toString(cryptoJS.enc.Utf8);

            return {
                ...list,
                password,
            }
        });

        const list = await List.findOne({
            where: {
                custom_path: id,
            }
        });

        const finalList = { ...list.dataValues };
        if (finalList.password) {
            const encrypt = cryptoJS.AES.decrypt(finalList.password, 'secretKey');
            const decrypt = encrypt.toString(cryptoJS.enc.Utf8);

            finalList.password = decrypt;
        }

        return res.render('forms/edit.ejs', {
            lists: newLists,
            list: finalList,
        });
    },

    handleEdit: async (req, res, next) => {
        const { id } = req.params;
        const updateObj = {};

        if (!req.body.password) updateObj.password = null;
        else updateObj.password = cryptoJS.AES.encrypt(req.body.password, 'secretKey').toString();
        
        try {
            await List.update(
                {
                    ...updateObj
                },
                {
                    where: {
                        custom_path: id,
                    }
                }
            )
        }
        catch(error) {
            return next(error);
        }

        res.redirect(`/edit/${ id }`);
    },

    handleDelete: async (req, res, next) => {
        try {
            await List.destroy({
                where: {
                    custom_path: req.params.id,
                }
            });
        }
        catch(error) {
            return next(error);
        }

        return res.redirect('/');
    },

    access: async (req, res, next) => {
        const { custom_path } = req.params;
        const fullUrl = req.protocol + '://' + req.headers.host + '/' + custom_path;
        const logged = req.flash("logged")[0];

        try {
            const list = await List.findOne({
                where: {
                    custom_path,
                }
            });

            if (list.password) {
                QRCode.toDataURL(fullUrl, (err, qrCodeUrl) => {
                    if (err) {
                      console.error('Lỗi tạo QR code:', err);
                      return res.sendStatus(500);
                    }

                    return res.render("safe_access/safe_access", {
                        layout: "layouts/safeAccessLayout",
                        list: list.dataValues,
                        errors: req.errors,
                        logged,
                        qrCodeUrl
                    });
                });
            } 
            else if (!list.password && list.safe_redirect) {
                await List.update(
                    { access_number: list.dataValues.access_number + 1 },
                    { where: { custom_path, } }
                );

                QRCode.toDataURL(fullUrl, (err, qrCodeUrl) => {
                    if (err) {
                      console.error('Lỗi tạo QR code:', err);
                      return res.sendStatus(500);
                    }

                    return res.render("safe_access/safe_access", {
                        layout: "layouts/safeAccessLayout",
                        list: list.dataValues,
                        logged: "logged",
                        qrCodeUrl,
                    });
                });
            }
            else {
                await List.update(
                    { access_number: list.dataValues.access_number + 1 },
                    { where: { custom_path, } }
                );

                return res.redirect(list.root_url);
            }
        }
        catch (error) {
            return next(error);
        }
    },

    handleAccess: async (req, res, next) => {
        const { custom_path } = req.params;
        
        try {
            const list = await List.findOne({
                where: {
                    custom_path,
                }
            });

            const body = await req.validate(req.body, {
                password: string().required("Vui lòng nhập mật khẩu!").test('check-pass', 'Nhập sai mật khẩu!', (value) => {
                    let result = false;

                    const encrypt = cryptoJS.AES.decrypt(list.dataValues.password, 'secretKey');
                    const decrypt = encrypt.toString(cryptoJS.enc.Utf8);

                    if (value === decrypt) result = true;

                    return result;
                }),
            });

            if (body) {
                req.flash("logged", "logged");

                await List.update(
                    { access_number: list.dataValues.access_number + 1 },
                    { where: { custom_path, } }
                );
            }
        }
        catch (error) {
            return next(error);
        }

        return res.redirect(`/${ custom_path }`);
    }
}