declare module "dicom-parser";

declare namespace React {
  interface InputHTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}
