import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const imagesDir = path.join(process.cwd(), 'public/images');
    const files = await fs.readdir(imagesDir);
    
    // Get all markdown files
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    // Read and parse each markdown file
    const images = await Promise.all(
      mdFiles.map(async (mdFile) => {
        const content = await fs.readFile(path.join(imagesDir, mdFile), 'utf-8');
        
        // Parse the YAML frontmatter
        const [, frontmatter] = content.split('---\n');
        const metadata = Object.fromEntries(
          frontmatter.split('\n')
            .filter(Boolean)
            .map(line => {
              const [key, ...value] = line.split(': ');
              return [key, value.join(': ')];
            })
        );

        return {
          id: mdFile.replace('.md', ''),
          title: metadata.title,
          path: metadata.image,
          thumbnailPath: metadata.thumbnailImage,
          modalPath: metadata.modalImage,
          uploadDate: metadata.uploadDate
        };
      })
    );

    // Sort by upload date, newest first
    images.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
}