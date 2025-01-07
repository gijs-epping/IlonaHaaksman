import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;
  const imagesDir = path.join(process.cwd(), 'public/images');
  const mdPath = path.join(imagesDir, `${id}.md`);

  // Handle PUT request (update title)
  if (req.method === 'PUT') {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // Read existing markdown file
      const content = await fs.readFile(mdPath, 'utf-8');
      const [frontMatterStart, frontmatter, ...rest] = content.split('---\n');
      
      // Parse existing metadata
      const metadata = Object.fromEntries(
        frontmatter.split('\n')
          .filter(Boolean)
          .map(line => {
            const [key, ...value] = line.split(': ');
            return [key, value.join(': ')];
          })
      );

      // Update title
      metadata.title = title;

      // Reconstruct markdown content
      const newContent = [
        '---',
        Object.entries(metadata)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n'),
        '---',
        ...rest
      ].join('\n');

      await fs.writeFile(mdPath, newContent);
      res.status(200).json({ message: 'Title updated successfully' });
    } catch (error) {
      console.error('Error updating title:', error);
      res.status(500).json({ error: 'Failed to update title' });
    }
  }
  // Handle DELETE request
  else if (req.method === 'DELETE') {
    try {
      // Read the markdown file to get the image path
      const content = await fs.readFile(mdPath, 'utf-8');
      const [, frontmatter] = content.split('---\n');
      const metadata = Object.fromEntries(
        frontmatter.split('\n')
          .filter(Boolean)
          .map(line => {
            const [key, ...value] = line.split(': ');
            return [key, value.join(': ')];
          })
      );

      // Get the image filename from the path
      const imagePath = path.join(process.cwd(), 'public', metadata.image);

      // Delete both the markdown file and the image
      await Promise.all([
        fs.unlink(mdPath),
        fs.unlink(imagePath)
      ]);

      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }
  // Handle unsupported methods
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}