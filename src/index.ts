import express, { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine } from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsStr = 'uploads'
const uploadDir = path.join(__dirname, uploadsStr);

const app = express();
const port = 3000;

app.use(cors());

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
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const id = req.query.id as string;
        let filename = req.file?.filename;

        try {
            if (id) {
                // If an ID is provided, override the filename to use the ID
                filename = `${id}.pdf`;
                const targetPath = path.join(uploadDir, filename);

                // Move the uploaded file to the target path, replacing if it exists
                await fs.move(req.file!.path, targetPath, { overwrite: true });
            }

            res.json({
                message: 'PDF file uploaded successfully!',
                filePath: `/${uploadsStr}/${filename}`,
            });
        } catch (error) {
            res.status(500).json({ error: 'Error processing the file' });
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