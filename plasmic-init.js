import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";
import ImageUploader from "./components/ImageUploader";
import ImageGallery from "./components/ImageGallery";
import GalleryDataProvider from "./components/GalleryDataProvider";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "oErkFAT7cy7QRgtshYsFJ4",
      token: "IzgVM2xzQVN2P6zms62sCp5D35hNarZiG9zwoEwP89P0b4SAQY7RZadJRarLq4Hn0HJuccHclGcSId2099A",
    },
  ],

  // By default Plasmic will use the last published version of your project.
  // For development, you can set preview to true, which will use the unpublished
  // project, allowing you to see your designs without publishing.  Please
  // only use this for development, as this is significantly slower.
  preview: false,
});

// You can register any code components that you want to use here; see
// https://docs.plasmic.app/learn/code-components-ref/
// And configure your Plasmic project to use the host url pointing at
// the /plasmic-host page of your nextjs app (for example,
// http://localhost:3000/plasmic-host).  See
// https://docs.plasmic.app/learn/app-hosting/#set-a-plasmic-project-to-use-your-app-host

// Register the ImageUploader component
PLASMIC.registerComponent(ImageUploader, {
  name: "ImageUploader",
  props: {
    className: "string",
  },
  description: "A component that allows uploading images with titles, storing them in public/images with corresponding markdown metadata files",
});

// Register the GalleryDataProvider component
PLASMIC.registerComponent(GalleryDataProvider, {
  name: "GalleryDataProvider",
  props: {
    className: "string",
    children: "slot"
  },
  providesData: true,
  description: "Provides gallery images data for use in Plasmic Studio",
});

// Register the ImageGallery component
PLASMIC.registerComponent(ImageGallery, {
  name: "ImageGallery",
  props: {
    className: "string",
  },
  description: "Displays uploaded images with options to edit titles and delete images",
});
