import { type koaCtx } from '../type/koaTypes.js'
import fs from 'fs/promises'
import path from 'path'

class UploadController {
  public static async uploadImage(ctx: koaCtx) {
    console.log('Upload request received.');
    console.log('ctx.request.files:', ctx.request.files);
    const file = ctx.request.files?.file;
    if (!file || Array.isArray(file)) {
      ctx.status = 400;
      ctx.body = { error: 'No file uploaded or multiple files uploaded.' };
      return;
    }

    const tempPath = file.filepath;
    const targetPath = path.join('uploads', ctx.params.fileName);
    console.log('tempPath:', tempPath);
    console.log('targetPath:', targetPath);
    const fileUrl = `/${ctx.params.fileName}`;

    try {
      await fs.rename(tempPath, targetPath);
      ctx.status = 200;
      ctx.body = {
        message: 'File uploaded successfully.',
        url: fileUrl
      };
    } catch (error) {
      console.error('Error renaming file:', error);
      ctx.status = 500;
      ctx.body = { error: 'Error processing file.' };
      // Clean up the temporary file
      await fs.unlink(tempPath).catch(err => console.error('Error deleting temp file:', err));
    }
  }
}

export { UploadController };
