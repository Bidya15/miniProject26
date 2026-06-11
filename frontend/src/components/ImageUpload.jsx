import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import styles from "../dashboard/dashboard.module.css";

export default function ImageUpload({
  currentImage,
  onImageChange,
  label = "Upload File",
  maxSizeMB = 5,
  aspectRatio = "free",
  supportedFormats = ["image", "pdf", "url"],
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || "");
  const [selectedFormat, setSelectedFormat] = useState(supportedFormats[0]);
  const fileInputRef = useRef(null);
  const { notify } = useApp();

  const getAcceptedTypes = () => {
    switch (selectedFormat) {
      case "image":
        return "image/jpeg,image/jpg,image/png,image/gif,image/webp";
      case "pdf":
        return "application/pdf";
      default:
        return "*";
    }
  };

  const getFormatLabel = () => {
    switch (selectedFormat) {
      case "image":
        return "Image (JPG, JPEG, PNG, GIF, WebP)";
      case "pdf":
        return "PDF Document";
      case "url":
        return "URL Link";
      default:
        return "Any File";
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      notify(`File size must be less than ${maxSizeMB}MB`, "err");
      return;
    }

    // Validate file type based on selected format
    if (selectedFormat === "image" && !file.type.startsWith("image/")) {
      notify("Please select an image file", "err");
      return;
    }
    if (selectedFormat === "pdf" && file.type !== "application/pdf") {
      notify("Please select a PDF file", "err");
      return;
    }

    setIsUploading(true);

    try {
      // Create preview for images, show file info for PDFs
      if (selectedFormat === "image") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
          onImageChange(e.target.result, file);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } else if (selectedFormat === "pdf") {
        // For PDFs, store file info instead of preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(`PDF: ${file.name}`);
          onImageChange(e.target.result, file); // Send Base64 string
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      notify("Failed to process file", "err");
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url) => {
    setPreview(url);
    onImageChange(url);
  };

  const removeFile = () => {
    setPreview("");
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderPreview = () => {
    if (!preview) return null;

    if (selectedFormat === "image") {
      return (
        <div className={styles.imagePreviewWrapper}>
          <img
            src={preview}
            alt="Preview"
            className={styles.imagePreview}
            style={{
              aspectRatio:
                aspectRatio === "square"
                  ? "1/1"
                  : aspectRatio === "video"
                    ? "16/9"
                    : "auto",
            }}
          />
          <button
            type="button"
            className={styles.removeImageBtn}
            onClick={removeFile}
          >
            ✕
          </button>
        </div>
      );
    } else if (selectedFormat === "pdf") {
      return (
        <div className={styles.filePreviewWrapper}>
          <div className={styles.pdfIcon}>📄</div>
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>
              {preview.replace("PDF: ", "")}
            </div>
            <div className={styles.fileType}>PDF Document</div>
          </div>
          <button
            type="button"
            className={styles.removeImageBtn}
            onClick={removeFile}
          >
            ✕
          </button>
        </div>
      );
    } else if (selectedFormat === "url") {
      return (
        <div className={styles.urlPreviewWrapper}>
          <div className={styles.urlIcon}>🔗</div>
          <div className={styles.urlInfo}>
            <div className={styles.urlText}>{preview}</div>
            <div className={styles.urlLabel}>URL Link</div>
          </div>
          <button
            type="button"
            className={styles.removeImageBtn}
            onClick={removeFile}
          >
            ✕
          </button>
        </div>
      );
    }
  };

  return (
    <div className={styles.imageUploadContainer}>
      <label className="form-label">{label}</label>

      {/* Format Selection */}
      {supportedFormats.length > 1 && (
        <div className={styles.formatSelection}>
          <label className="form-label-sm">File Type:</label>
          <div className={styles.formatOptions}>
            {supportedFormats.map((format) => (
              <button
                key={format}
                type="button"
                className={`${styles.formatBtn}${selectedFormat === format ? ` ${styles.active}` : ""}`}
                onClick={() => setSelectedFormat(format)}
              >
                {format === "image" && "🖼️ Image"}
                {format === "pdf" && "📄 PDF"}
                {format === "url" && "🔗 URL"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.imageUploadPreview}>
        {preview ? (
          renderPreview()
        ) : (
          <div className={styles.imageUploadPlaceholder}>
            <div className={styles.uploadIcon}>
              {selectedFormat === "image" && "📷"}
              {selectedFormat === "pdf" && "📄"}
              {selectedFormat === "url" && "🔗"}
            </div>
            <p>No {selectedFormat} selected</p>
            <small>{getFormatLabel()}</small>
          </div>
        )}
      </div>

      <div className={styles.imageUploadControls}>
        {selectedFormat !== "url" && (
          <div className={styles.uploadBtnGroup}>
            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedTypes()}
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading
                ? "⏳ Uploading..."
                : `📁 Choose ${selectedFormat === "pdf" ? "PDF" : selectedFormat === "url" ? "URL" : "Image"}`}
            </button>
          </div>
        )}

        <div className={styles.urlInputGroup}>
          {selectedFormat === "url" ? (
            <input
              type="url"
              className="inp inp-sm"
              placeholder="Enter image or document URL..."
              value={preview.startsWith("data:") ? "" : preview}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          ) : (
            <input
              type="url"
              className="inp inp-sm"
              placeholder="Or paste URL (optional)..."
              value={
                preview.startsWith("data:") || preview.startsWith("PDF:")
                  ? ""
                  : preview
              }
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className={styles.imageUploadInfo}>
        <small className="text-gray">
          {selectedFormat === "image" &&
            `Max size: ${maxSizeMB}MB • Formats: JPG, JPEG, PNG, GIF, WebP`}
          {selectedFormat === "pdf" &&
            `Max size: ${maxSizeMB}MB • Format: PDF only`}
          {selectedFormat === "url" && `Enter direct URL to image or document`}
        </small>
      </div>
    </div>
  );
}
