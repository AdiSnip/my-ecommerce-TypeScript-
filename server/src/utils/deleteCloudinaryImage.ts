import { v2 as cloudinary } from 'cloudinary';

export class DeleteCloudinaryImage {
    
    static extractPublicId(cloudinaryUrl: string) {
        // This regex looks for everything between the version (v123...) and the file extension
        const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
        const match = cloudinaryUrl.match(regex);
    
        if (match && match[1]) {
            return match[1];
    }
    return null;
    }
    
    static async deleteImage(publicId: string) {
        return await cloudinary.uploader.destroy(publicId,(err, result) => {
            if (err) {
                console.log(err);
                return false;
            }
            console.log(result);
            return true;
        });
    }

}
