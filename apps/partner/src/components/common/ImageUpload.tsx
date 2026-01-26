import React, { useRef, useState } from 'react';
import { Button } from "../ui/button";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../ui/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onUpload?: (file: File) => Promise<void>; // Add optional onUpload prop
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

export function ImageUpload({ 
  value, 
  onChange,
  onUpload, // Destructure
  maxSizeMB = 5, 
  label = "Upload Image",
  className 
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      const msg = "Please upload an image file (JPG, PNG, WEBP)";
      setError(msg);
      toast.error(msg);
      return;
    }

    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      const msg = `Image size must be less than ${maxSizeMB}MB`;
      setError(msg);
      toast.error(msg);
      return;
    }

    // If onUpload is provided, use it
    if (onUpload) {
        await onUpload(file);
        // We usually expect onUpload to handle the onChange update if valid, 
        // OR we can still read it for preview. 
        // Logic in MenuManager sets the image_url after upload.
        // So we don't strictly need to do anything here except maybe show loading.
        return;
    }

    // Fallback: Read as Data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out cursor-pointer group overflow-hidden bg-gray-50/50",
          isDragActive ? "border-[#1BA672] bg-[#E8F6F1]" : "border-gray-200 hover:border-[#1BA672] hover:bg-gray-50",
          error ? "border-red-300 bg-red-50" : "",
          value ? "h-48 border-solid border-gray-200" : "h-32"
        )}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
      >



        {value ? (
          <div className="w-full h-full relative group">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
               <span className="text-white font-medium text-sm">Click to change</span>
               <Button 
                 variant="destructive" 
                 size="icon" 
                 className="h-8 w-8 rounded-full"
                 onClick={removeImage}
                >
                 <X className="w-4 h-4" />
               </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
            <div className={cn(
                "p-3 rounded-full bg-white shadow-sm transition-transform duration-200 group-hover:scale-110",
                isDragActive ? "text-[#1BA672]" : "text-gray-400"
            )}>
               <Upload className="w-6 h-6" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-medium text-gray-700">
                <span className="text-[#1BA672] hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                SVG, PNG, JPG or WEBP (max. {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
          onChange={handleChange}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={(e) => {
             e.preventDefault();
             setIsDragActive(false);
          }}
        />
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">
            <AlertCircle className="w-3 h-3" />
            {error}
        </div>
      )}
    </div>
  );
}
