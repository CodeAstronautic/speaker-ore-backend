import { Injectable } from '@nestjs/common'
import * as AWS from 'aws-sdk'


@Injectable()
export class UploadService {
    s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3({ 
            region: 'ap-south-1',  
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
    }

    upload = async (files: any[]) => {
        const promises = files.map(async file => await this.uploadS3(file.buffer, file.originalname));
        return await Promise.all(promises);
    }

    get = async(files: string[]) => {
        const promises = files.map(async file => await this.getS3(file))
        return await Promise.all(promises);
    }


    getS3 = async(file: string) => {
        return new Promise((res, rej) => {
            this.s3.listObjects({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
            }, (err, data) => {
                if (err) rej(err);
                res(data);
            })
        })
    }

    uploadS3 = (file, name: string) => {
        return new Promise((res, rej) => {
            this.s3.upload({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `folder/${name}`,
                Body: file
            }, (err, data) => {
                if (err) {
                    rej(err);
                }
                res(data);
            })
        })
    }
}
