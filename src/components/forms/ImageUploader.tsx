'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { X, UploadCloud, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      setProgress(0);

      try {
        const uploadedUrls: string[] = [];

        // Upload files sequentially to track individual progress better, or use Promise.all 
        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];
          const url = await uploadToCloudinary(file, (p) => {
            // Very rough overall progress estimation
            setProgress(Math.round(((i * 100) + p) / acceptedFiles.length));
          });
          uploadedUrls.push(url);
        }

        onChange([...value, ...uploadedUrls]);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [value, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.webp'],
    },
    disabled: isUploading,
  });

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-slate-300">
                Uploading... {progress}%
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-slate-800 rounded-full mb-2">
                <UploadCloud className="h-6 w-6 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                Click or drag images to upload
              </p>
              <p className="text-xs text-slate-500">
                Supports JPG, PNG, GIF, WebP
              </p>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
