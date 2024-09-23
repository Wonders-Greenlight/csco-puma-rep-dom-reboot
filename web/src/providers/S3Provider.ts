import S3 from 'aws-sdk/clients/s3' // DEPRECATED
import { 
    S3Client, PutObjectCommand, GetObjectCommand, 
    DeleteObjectCommand
} from '@aws-sdk/client-s3';


class S3Provider {
    public s3Client: S3Client
    public s3ClientV2: S3
    public uri: string = process.env.S3_BUCKET_URI
    public bucketName: string
    public region: string
    private accessKeyId: string
    private secretAccessKey: string

    constructor( bucketName?: string, region?: string ) {
        this.bucketName = bucketName || process.env.S3_BUCKET_NAME
        this.region = region || process.env.S3_BUCKET_REGION
        this.accessKeyId = process.env.S3_USER_ACCESS_KEY
        this.secretAccessKey = process.env.S3_USER_SECRET_KEY

        this.s3Client = new S3Client({ 
            region: this.region,
            credentials:{
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
            }
        })

        this.s3ClientV2 = new S3({
            region: this.region,
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
        })
    }

    public async uploadFile (fileInfo: string | Buffer, fileName: string) {
        const base64Data = Buffer.isBuffer(fileInfo) ? fileInfo : Buffer.from(fileInfo, 'base64')

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Body: base64Data,
            Key: fileName
        });
        
        try {
            const response = await this.s3Client.send(command);

            if (response.$metadata.httpStatusCode == 200) {
                let url = `https://${ this.bucketName }.s3.amazonaws.com/${ fileName }`
                return url
            }
            
            return response
        } catch (err) {
            console.error(err)
        }
    }

    public async getFile( fileName: string ) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: fileName
        });
    
        try {
            const { Body } = await this.s3Client.send(command)

            return Body as NodeJS.ReadableStream
        } catch (err) {
            console.error(err)
            return err
        }
    }

    public async deleteFile( fileName: string ) {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: fileName
        });
        
        try {
            const response = await this.s3Client.send(command)

            return response
        } catch (err) {
            console.error(err);
            throw new Error('Error getting object from S3')
        }
    }

    // -------------------- V2 OLD DEPRECATED METHODS
    public async uploadHttpFileV2( fileData: any ) {
        return this.s3ClientV2.upload({
            Bucket: this.bucketName,
            Body: fileData.data,
            Key: fileData.name || `file_${Date.now()}`
        }).promise()
    }

    public async uploadFileV2( fileData: Buffer | ArrayBuffer, fileName?: string ) {
        return this.s3ClientV2.upload({
            Bucket: this.bucketName,
            Body: fileData,
            Key: fileName || `file_${Date.now()}`
        }).promise()
    }

    public async getFileV2( fileName: string ) {
        const checkFile = await this.s3ClientV2.getObject({
            Bucket: this.bucketName,
            Key: fileName
        }).promise()

        return this.s3ClientV2.getObject({
            Bucket: this.bucketName,
            Key: fileName
        }).createReadStream()
    }

    public async getFileDataV2( fileName: string ) {
        return await this.s3ClientV2.getObject({
            Bucket: this.bucketName,
            Key: fileName
        }).promise()
    }

    public async deleteFileV2( fileName: string ) {
        return this.s3ClientV2.deleteObject({
            Bucket: this.bucketName,
            Key: fileName,
        }).createReadStream()
    }
}

export default S3Provider