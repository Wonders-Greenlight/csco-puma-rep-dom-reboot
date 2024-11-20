import crypto from 'crypto';
import config from '../config.js';
import User from '../models/UserModel.js'
import jwt from 'jsonwebtoken'

import { IUser, Role } from '../interfaces/UserInterface.js'
import { PaginationModel } from 'mongoose-paginate-ts';
import axios, { AxiosError } from 'axios';

class HelpersController {
    public async createNewApiUser(user: { userName: string, password: string, roles: Role[] }) {
        if ( !user.userName || !user.password ) {
            throw { 
                message: 'Bad request, expecting userName & password at least' 
            }
        }

        const existUser = await User.findOne({ userName: user.userName })
        if ( existUser ) return { status_detail: 'Username already exists' }
        
        const userObj = new User(user)
        const savedUser = await userObj.save()

        return {
            status_detail: 'User saved successfully',
            user: savedUser
        }
    }

    public hash256( data: string ): string {
        return crypto.createHash('sha256').update(data, 'binary').digest('base64');
    }

    public async sleep( ms: number ): Promise<void> {
        return new Promise(res => setTimeout(res, ms))
    }

    public groupArrayIntoPools<T = any>(arr: T[], poolSize: number) {
        const result = []
        
        for (let i = 0; i < arr.length; i += poolSize) {
            result.push(arr.slice(i, i + poolSize));
        }

        return result
    }

    public sessionRemover<T>( classArray: T[] ): T[] {
        return classArray.map( (obj: any) => {
            if ( obj.session ) delete obj.session
            Object.keys(obj).forEach( key => {
                if ( Array.isArray( obj[key] ) ) 
                    obj[key] = this.sessionRemover( obj[key] )
            })

            return obj
        })
    }

    public createUserToken( user: IUser, options: jwt.SignOptions ): string {
        console.log(user);
        return jwt.sign({
            id: user._id,
            userName: user.userName,
            roles: user.roles
        }, config.JWT.SECRET_TOKEN, options)
    }

    public createToken( payload: any, options: jwt.SignOptions, privateToken: string = config.JWT.SECRET_TOKEN ): string {
        return jwt.sign(payload, privateToken, options)
    }

    public authenticateJwt( token: string ) {
        jwt.verify(token, config.JWT.SECRET_TOKEN, (err, user) => {
            if ( err ) return { status: false }
            return { status: true, user }
        })
    }

    public getJwtTokenPayload( token: string ) {
        return new Promise((res, rej) => {
            jwt.verify(token, config.JWT.SECRET_TOKEN, (err, payload) => {
                if ( err ) return rej({ status: false, error: err })
                return res({ status: true, payload })
            })
        })
    }

    public formatVoidPagination( totalDocs: number, limit: number, page: number ): PaginationModel<any> {
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
        }
    }

    public async sendSlackMessage( whereWas: string, sectionErrorJson: any ): Promise<any> {
        try {
            await axios.post(
                'https://hooks.slack.com/services/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', 
                {
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
                }
            )
        } catch (err) {
            // console.log(err)
            const errorData = err.isAxiosError
                ? err.response?.data
                : err.message

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
            ])
        }
    }
}

export default new HelpersController()
