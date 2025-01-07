import React, { useState, useEffect } from 'react';
import { DataProvider } from '@plasmicapp/loader-nextjs';
import { PlasmicCanvasContext } from '@plasmicapp/loader-nextjs';

function GalleryDataProvider({ children, className }) {
  const [images, setImages] = useState([]);
  const inEditor = React.useContext(PlasmicCanvasContext);

  useEffect(() => {
    if (!inEditor) {
      fetchImages();
    }
  }, [inEditor]);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Failed to load images:', error);
      setImages([]);
    }
  };

  // Sample data for editor mode
  const sampleImages = [
    {
      id: 'sample1',
      title: 'Sample Image 1',
      path: '/images/sample1.jpg',
      thumbnailPath: '/images/sample1_thumb.jpg',
      modalPath: '/images/sample1_modal.jpg',
      uploadDate: new Date().toISOString()
    },
    {
      id: 'sample2',
      title: 'Sample Image 2',
      path: '/images/sample2.jpg',
      thumbnailPath: '/images/sample2_thumb.jpg',
      modalPath: '/images/sample2_modal.jpg',
      uploadDate: new Date().toISOString()
    }
  ];

  return (
    <div className={className}>
      <DataProvider 
        name="galleryImages" 
        data={inEditor ? sampleImages : images}
        label="Gallery Images"
        description="Images and titles from the gallery"
      >
        {children}
      </DataProvider>
    </div>
  );
}

export default GalleryDataProvider;