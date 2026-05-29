"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
                        setProgress(
                            Math.round((i * 100 + p) / acceptedFiles.length),
                        );
                    });
                    uploadedUrls.push(url);
                }

                onChange([...value, ...uploadedUrls]);
            } catch (error) {
                console.error("Upload failed:", error);
            } finally {
                setIsUploading(false);
                setProgress(0);
            }
        },
        [value, onChange],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".png", ".jpg", ".gif", ".webp"],
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
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white shadow-sm ${
                    isDragActive
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center gap-2">
                    {isUploading ? (
                        <>
                            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                            <p className="text-sm font-medium text-slate-700">
                                Uploading... {progress}%
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-indigo-50 rounded-full mb-2 ring-1 ring-indigo-100">
                                <UploadCloud className="h-6 w-6 text-indigo-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">
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
                        <div
                            key={index}
                            className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm"
                        >
                            <Image
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                fill
                                unoptimized
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
