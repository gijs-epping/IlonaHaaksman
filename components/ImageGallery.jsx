import React, { useState, useEffect } from 'react';
import { PlasmicCanvasContext } from '@plasmicapp/loader-nextjs';
import styles from './ImageGallery.module.css';

function ImageGallery({ className }) {
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const inEditor = React.useContext(PlasmicCanvasContext);

  // Fetch images on component mount and when images are uploaded
  useEffect(() => {
    fetchImages();

    // Listen for image upload events
    const handleImageUpload = () => {
      fetchImages();
    };

    window.addEventListener('imageUploaded', handleImageUpload);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('imageUploaded', handleImageUpload);
    };
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      setMessage('Failed to load images: ' + error.message);
    }
  };

  const handleEdit = (image) => {
    setEditingId(image.id);
    setEditTitle(image.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleSaveEdit = async (image) => {
    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) throw new Error('Failed to update title');

      setMessage('Title updated successfully');
      setEditingId(null);
      fetchImages(); // Refresh the list
      
      // Clear success message after 1 second
      setTimeout(() => {
        setMessage('');
      }, 1000);
    } catch (error) {
      setMessage('Failed to update title: ' + error.message);
    }
  };

  const handleDelete = async (image) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setMessage('Image deleted successfully');
      fetchImages(); // Refresh the list
      
      // Clear success message after 1 second
      setTimeout(() => {
        setMessage('');
      }, 1000);
    } catch (error) {
      setMessage('Failed to delete image: ' + error.message);
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Show placeholder in Plasmic editor
  if (inEditor) {
    return (
      <div className={`${styles.gallery} ${className}`}>
        <div className={styles.imageCard}>
          <div className={styles.imageContainer}>
            <div className={styles.image} style={{ background: '#f0f0f0' }} />
          </div>
          <div className={styles.content}>
            <h3 className={styles.title}>Sample Image Title</h3>
            <div className={styles.buttons}>
              <button className={`${styles.button} ${styles.editButton}`} disabled>
                Edit
              </button>
              <button className={`${styles.button} ${styles.deleteButton}`} disabled>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.gallery} ${className}`}>
      {message && (
        <p className={`${styles.message} ${styles[message.includes('success') ? 'success' : 'error']}`}>
          {message}
        </p>
      )}
      {images.map((image) => (
        <div key={image.id} className={styles.imageCard}>
          <div className={styles.imageContainer} onClick={() => openModal(image)}>
            <img src={image.thumbnailPath} alt={image.title} className={styles.image} />
          </div>
          <div className={styles.content}>
            {editingId === image.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={styles.titleInput}
                />
                <div className={styles.buttons}>
                  <button
                    onClick={() => handleSaveEdit(image)}
                    className={`${styles.button} ${styles.saveButton}`}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={`${styles.button} ${styles.cancelButton}`}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className={styles.title}>{image.title}</h3>
                <div className={styles.buttons}>
                  <button
                    onClick={() => handleEdit(image)}
                    className={`${styles.button} ${styles.editButton}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(image)}
                    className={`${styles.button} ${styles.deleteButton}`}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      {selectedImage && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <img src={selectedImage.modalPath} alt={selectedImage.title} className={styles.modalImage} />
            <h3 className={styles.modalTitle}>{selectedImage.title}</h3>
            <button onClick={closeModal} className={styles.closeButton}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;