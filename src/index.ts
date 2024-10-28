import express, { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine } from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsStr = 'uploads'
const uploadDir = path.join(__dirname, uploadsStr);

const app = express();
const port = 3000;

const storage: StorageEngine = multer.diskStorage({
    destination: async (_req: Request, _file: Express.Multer.File, cb) => {
        await fs.ensureDir(uploadDir);
        cb(null, uploadDir);
    },
    filename: async (_req: Request, file: Express.Multer.File, cb) => {
        try {
            const files = await fs.readdir(uploadDir); // List all files in the upload directory
            const nextFileNumber = files.length + 1; // Determine the next file number
            cb(null, `${nextFileNumber}.pdf`); // Name the file based on the count
        } catch (error) {
            cb(error, file.originalname); // Fallback to original name if an error occurs
        }
    }
});

const upload = multer({ storage });

app.post(
    '/upload',
    upload.single('pdfFile'),
    (req: Request, res: Response, _next: NextFunction): void => {
        debugger
        if (req.file) {
            res.json({
                message: 'PDF file uploaded successfully!',
                filePath: `/${uploadsStr}/${req.file.filename}`
            });
        } else {
            res.status(400).json({ error: 'No file uploaded' });
        }
    }
);

app.get('/download/:fileNumber', (req: Request, res: Response) => {
    const fileNumber = req.params.fileNumber;
    const filePath = path.join(uploadDir, `${fileNumber}.pdf`);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
