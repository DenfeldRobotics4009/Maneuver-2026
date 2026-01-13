import { useState, useRef } from "react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Camera, Upload, X, Image } from "lucide-react";
import { toast } from "sonner";

interface RobotPhotoSectionProps {
  robotPhoto?: string;
  onRobotPhotoChange: (photo: string | undefined) => void;
}

export function RobotPhotoSection({
  robotPhoto,
  onRobotPhotoChange,
}: RobotPhotoSectionProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    // Show the video element first
    setIsCapturing(true);
    setIsStreamReady(false);
    
    try {
      let stream: MediaStream | null = null;
      
      // First, try to get the back camera (environment-facing)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { exact: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
        });
      } catch {
        // If exact back camera fails, try with ideal preference (allows fallback)
        console.log("Back camera not available, trying with ideal preference...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
        });
      }
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for the video metadata to load before showing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsStreamReady(true);
            }).catch((err) => {
              console.error("Error playing video:", err);
              toast.error("Failed to start video preview");
              stopCamera();
            });
          }
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please check permissions.");
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setIsStreamReady(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        onRobotPhotoChange(photoDataUrl);
        stopCamera();
        toast.success("Photo captured!");
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onRobotPhotoChange(result);
        toast.success("Photo uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    onRobotPhotoChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Photo removed");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Robot Photo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera view (shown when capturing) */}
        {isCapturing && (
          <div className="space-y-2">
            <div className="relative w-full rounded-lg border bg-black overflow-hidden">
              {!isStreamReady && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ minHeight: '300px' }}>
                  <div className="text-white text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                    <p>Loading camera...</p>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg"
                style={{ maxHeight: '60vh', display: isStreamReady ? 'block' : 'none' }}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1" disabled={!isStreamReady}>
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Photo preview (shown when photo exists) */}
        {robotPhoto && !isCapturing && (
          <div className="space-y-2">
            <img
              src={robotPhoto}
              alt="Robot"
              className="w-full rounded-lg border"
            />
            <div className="flex gap-2">
              <Button onClick={startCamera} variant="outline" className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button onClick={clearPhoto} variant="destructive" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons (shown when no photo) */}
        {!robotPhoto && !isCapturing && (
          <div className="flex gap-2">
            <Button onClick={startCamera} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Optional: Take or upload a photo of the robot (max 5MB)
        </p>
      </CardContent>
    </Card>
  );
}
