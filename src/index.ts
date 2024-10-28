import express, { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine } from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Storage setup with multer
const storage: StorageEngine = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
        const uploadDir = path.join(__dirname, 'public');
        fs.ensureDirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (_req: Request, _: Express.Multer.File, cb) => {
        cb(null, 'uploaded_file.pdf'); // Store the file with a fixed name
    }
});

const upload = multer({ storage });

// Endpoint to upload a PDF file
app.post(
    '/upload',
    upload.single('pdfFile'),
    (req: Request, res: Response, _next: NextFunction): void => {
        if (req.file) {
            console.log(`File uploaded successfully: ${req.file.path}`);
            res.json({
                message: 'PDF file uploaded successfully!',
                filePath: `/public/uploaded_file.pdf`
            });
        } else {
            res.status(400).json({ error: 'No file uploaded' });
        }
    }
);

// Endpoint to retrieve the uploaded PDF file
app.get('/download', (_: Request, res: Response): void => {
    const filePath = path.join(__dirname, 'public', 'uploaded_file.pdf');

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ error: 'File could not be sent' });
            }
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
