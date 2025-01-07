import React, { useState } from 'react';
import { PlasmicCanvasContext } from '@plasmicapp/loader-nextjs';
import styles from './ImageUploader.module.css';

function ImageUploader({ className }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageTitle, setImageTitle] = useState('');
  const [message, setMessage] = useState('');
  const inEditor = React.useContext(PlasmicCanvasContext);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Please select an image file');
      setSelectedFile(null);
    }
  };

  const handleTitleChange = (event) => {
    setImageTitle(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setMessage('Please select an image file');
      return;
    }

    if (!imageTitle.trim()) {
      setMessage('Please enter a title for the image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', imageTitle);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setMessage('Image uploaded successfully!');
      setSelectedFile(null);
      setImageTitle('');
      
      // Dispatch a custom event to notify the gallery to refresh
      const event = new CustomEvent('imageUploaded');
      window.dispatchEvent(event);

      // Clear success message after 1 second
      setTimeout(() => {
        setMessage('');
      }, 1000);
    } catch (error) {
      setMessage('Failed to upload image: ' + error.message);
    }
  };

  const messageType = message.toLowerCase().includes('success') ? 'success' : 'error';

  // Disable functionality in Plasmic editor
  if (inEditor) {
    return (
      <div className={className}>
        <div className={styles['upload-form']}>
          <input type="file" disabled />
          <input
            type="text"
            placeholder="Enter image title"
            disabled
          />
          <button disabled>Upload Image</button>
        </div>
        <p className={styles.message}>Image upload functionality is disabled in editor</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className={styles['upload-form']}>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
        />
        <input
          type="text"
          value={imageTitle}
          onChange={handleTitleChange}
          placeholder="Enter image title"
        />
        <button type="submit" disabled={!selectedFile || !imageTitle.trim()}>
          Upload Image
        </button>
      </form>
      {message && (
        <p className={`${styles.message} ${styles[messageType]}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default ImageUploader;