import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Disable body parsing, we'll handle the multipart form data ourselves
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/images'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    // Parse the form data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    const title = fields.title[0];

    if (!file || !title) {
      return res.status(400).json({ error: 'Missing file or title' });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename;
    const extension = path.extname(originalName);
    const baseFilename = `${timestamp}`;

    // Define filenames for different sizes
    const filenames = {
      original: `${baseFilename}_original${extension}`,
      modal: `${baseFilename}_modal${extension}`,
      thumbnail: `${baseFilename}_thumb${extension}`,
    };

    // Create the images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), 'public/images');
    await fs.mkdir(imagesDir, { recursive: true });

    // Process and save images in different sizes
    const imageBuffer = await fs.readFile(file.filepath);
    
    // Save original
    await fs.writeFile(
      path.join(imagesDir, filenames.original),
      imageBuffer
    );

    // Create and save modal size (max 800x800)
    await sharp(imageBuffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(path.join(imagesDir, filenames.modal));

    // Create and save thumbnail (max 280x280)
    await sharp(imageBuffer)
      .resize(280, 280, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(path.join(imagesDir, filenames.thumbnail));

    // Remove the temporary file
    await fs.unlink(file.filepath);

    // Create markdown file with metadata including all image versions
    const mdContent = `---
title: ${title}
image: /images/${filenames.original}
modalImage: /images/${filenames.modal}
thumbnailImage: /images/${filenames.thumbnail}
uploadDate: ${new Date().toISOString()}
---`;

    const mdPath = path.join(process.cwd(), 'public/images', `${baseFilename}.md`);
    await fs.writeFile(mdPath, mdContent);

    res.status(200).json({
      message: 'Upload successful',
      images: {
        original: filenames.original,
        modal: filenames.modal,
        thumbnail: filenames.thumbnail,
      },
      title,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}