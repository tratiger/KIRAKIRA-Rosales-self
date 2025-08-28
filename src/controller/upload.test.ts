import supertest from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from '../route/router.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
app.use(bodyParser());
app.use(router.routes());

const request = supertest(app.callback());

const uploadsDir = path.join(__dirname, '../../uploads');

// Clean up the uploads directory before and after tests
beforeAll(() => {
  if (fs.existsSync(uploadsDir)) {
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(uploadsDir, { recursive: true });
});

afterAll(() => {
  if (fs.existsSync(uploadsDir)) {
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  }
});

describe('Upload Endpoints', () => {
    it('should upload an avatar image to /user/avatar/preUpload', async () => {
        const filePath = path.join(__dirname, 'test-avatar.png');
        fs.writeFileSync(filePath, 'test image data');

        const response = await request
        .post('/user/avatar/preUpload')
        .attach('avatar', filePath);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.userAvatarFilename).toMatch(/avatar-\d+-[a-zA-Z0-9]+-\d+\.png/);
        expect(response.body.userAvatarUploadSignedUrl).toMatch(/\/uploads\/images\/avatars\/[a-f0-9-]+\.png/);

        const uploadedFilePath = path.join(uploadsDir, response.body.userAvatarUploadSignedUrl.replace('/uploads', ''));
        expect(fs.existsSync(uploadedFilePath)).toBe(true);

        fs.unlinkSync(filePath);
    });

    it('should upload a video cover to /video/cover/preUpload', async () => {
        const filePath = path.join(__dirname, 'test-cover.png');
        fs.writeFileSync(filePath, 'test image data');

        const response = await request
        .post('/video/cover/preUpload')
        .attach('cover', filePath);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.result.fileName).toMatch(/video-cover-\d+-[a-zA-Z0-9]+-\d+\.png/);
        expect(response.body.result.signedUrl).toMatch(/\/uploads\/images\/posters\/[a-f0-9-]+\.png/);

        const uploadedFilePath = path.join(uploadsDir, response.body.result.signedUrl.replace('/uploads', ''));
        expect(fs.existsSync(uploadedFilePath)).toBe(true);

        fs.unlinkSync(filePath);
    });

    it('should upload a feed group cover to /feed/getFeedGroupCoverUploadSignedUrl', async () => {
        const filePath = path.join(__dirname, 'test-feed-cover.png');
        fs.writeFileSync(filePath, 'test image data');

        const response = await request
        .post('/feed/getFeedGroupCoverUploadSignedUrl')
        .attach('feed-cover', filePath);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.result.fileName).toMatch(/feed-group-cover-undefined-[a-zA-Z0-9]+-\d+\.png/);
        expect(response.body.result.signedUrl).toMatch(/\/uploads\/images\/feeds\/[a-f0-9-]+\.png/);

        const uploadedFilePath = path.join(uploadsDir, response.body.result.signedUrl.replace('/uploads', ''));
        expect(fs.existsSync(uploadedFilePath)).toBe(true);

        fs.unlinkSync(filePath);
    });
});
