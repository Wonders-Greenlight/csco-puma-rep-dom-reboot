import crypto from 'crypto';
import config from '../config.js';
import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
class HelpersController {
    async createNewApiUser(user) {
        if (!user.userName || !user.password) {
            throw {
                message: 'Bad request, expecting userName & password at least'
            };
        }
        const existUser = await User.findOne({ userName: user.userName });
        if (existUser)
            return { status_detail: 'Username already exists' };
        const userObj = new User(user);
        const savedUser = await userObj.save();
        return {
            status_detail: 'User saved successfully',
            user: savedUser
        };
    }
    hash256(data) {
        return crypto.createHash('sha256').update(data, 'binary').digest('base64');
    }
    async sleep(ms) {
        return new Promise(res => setTimeout(res, ms));
    }
    groupArrayIntoPools(arr, poolSize) {
        const result = [];
        for (let i = 0; i < arr.length; i += poolSize) {
            result.push(arr.slice(i, i + poolSize));
        }
        return result;
    }
    sessionRemover(classArray) {
        return classArray.map((obj) => {
            if (obj.session)
                delete obj.session;
            Object.keys(obj).forEach(key => {
                if (Array.isArray(obj[key]))
                    obj[key] = this.sessionRemover(obj[key]);
            });
            return obj;
        });
    }
    createUserToken(user, options) {
        console.log(user);
        return jwt.sign({
            id: user._id,
            userName: user.userName,
            roles: user.roles
        }, config.JWT.SECRET_TOKEN, options);
    }
    createToken(payload, options, privateToken = config.JWT.SECRET_TOKEN) {
        return jwt.sign(payload, privateToken, options);
    }
    authenticateJwt(token) {
        jwt.verify(token, config.JWT.SECRET_TOKEN, (err, user) => {
            if (err)
                return { status: false };
            return { status: true, user };
        });
    }
    getJwtTokenPayload(token) {
        return new Promise((res, rej) => {
            jwt.verify(token, config.JWT.SECRET_TOKEN, (err, payload) => {
                if (err)
                    return rej({ status: false, error: err });
                return res({ status: true, payload });
            });
        });
    }
    formatVoidPagination(totalDocs, limit, page) {
        return {
            totalDocs,
            limit,
            totalPages: totalDocs / limit,
            page,
            pagingCounter: page,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: 0,
            nextPage: 0,
            hasMore: false,
            docs: []
        };
    }
    async sendSlackMessage(whereWas, sectionErrorJson) {
        try {
            await axios.post('https://hooks.slack.com/services/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', {
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: config.GLOBAL.APP_NAME,
                            emoji: true
                        }
                    },
                    {
                        type: 'section',
                        fields: [{
                                type: 'mrkdwn',
                                text: `*Resource:*\n${whereWas}`
                            }]
                    },
                    ...sectionErrorJson
                ]
            });
        }
        catch (err) {
            // console.log(err)
            const errorData = err.isAxiosError
                ? err.response?.data
                : err.message;
            return this.sendSlackMessage('Slack Messager', [
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Error:*\n\`\`\`${JSON.stringify(errorData)}\`\`\``
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Comes from:*\n${whereWas}`
                        }
                    ]
                }
            ]);
        }
    }
}
export default new HelpersController();
