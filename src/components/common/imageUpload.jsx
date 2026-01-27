import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Camera } from "lucide-react";
import Button from "./Button";
import Input from "./Input";



const ImageUpload = forwardRef((props, ref) => {
  const filePickerRef = useRef();
  const [previewUrl, setPreviewUrl] = useState();

  useImperativeHandle(ref, () => ({
    focus: () => {
      filePickerRef.current?.focus();
    },
    click: () => {
      filePickerRef.current?.click();
    }
  }));

  useEffect(() => {
    if (!props.value) {
      setPreviewUrl(null);
      return;
    }

    if (typeof props.value === 'string') {
      setPreviewUrl(props.value);
    } else if (props.value instanceof File || props.value instanceof Blob) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(props.value);
    }
  }, [props.value]);

  const pickedHandler = (e) => {
    const pickedFile = e.target.files?.[0];
    if (pickedFile) {
      props.onChange?.(pickedFile);
    } 
  };

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  return (
    <div className="w-full">
      <Input
        ref={filePickerRef}
        id={props.id}
        style={{ display: "none" }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      
      <div className={`card image-upload-card ${props.error ? 'border-red-500' : ''}`}>
        {props.id === "equipmentImage" ? <h3>Asset Photo</h3>: <h3>Upload Proof (Photo)</h3>}
        <div className="photo-upload-area" onClick={pickImageHandler}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "5px" }}
            />
          ) : (
            <div className="placeholder-content" style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#888"}}>
              <Camera size={32} />
              <p>Upload or Take Photo</p>
            </div>
          )}
        </div>
        <Button 
            type="button" 
            variant="secondary" 
            className="w-full" 
            onClick={pickImageHandler}
        >
          {previewUrl ? 'Change Image' : 'Upload Image'}
        </Button>
      </div>
      
      {props.error && (
        <span style={{ color: '#e11d48', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
          {props.error}
        </span>
      )}
    </div>
  );
});

export default ImageUpload;