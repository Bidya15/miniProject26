import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import ImageUpload from "../components/ImageUpload";
import styles from "../dashboard/dashboard.module.css";

export default function ManageHomeImages() {
    const { homeContent, updateHome, notify } = useApp();
    const [editData, setEditData] = useState({
        bgImages: [...(homeContent?.bgImages || [])]
    });

    const handleImageChange = (index, imageUrl) => {
        const newImages = [...editData.bgImages];
        newImages[index] = imageUrl;
        setEditData({ ...editData, bgImages: newImages });
    };

    const addImageSlot = () => {
        setEditData({
            ...editData,
            bgImages: [...editData.bgImages, ""]
        });
    };

    const removeImageSlot = (index) => {
        const newImages = editData.bgImages.filter((_, i) => i !== index);
        setEditData({ ...editData, bgImages: newImages });
    };

    const save = () => {
        const validImages = editData.bgImages.filter(img => img.trim() !== "");
        if (validImages.length === 0) {
            return notify("Please add at least one background image", "err");
        }
        
        updateHome({ ...homeContent, bgImages: validImages });
        notify("Home page background images updated successfully", "ok");
    };

    return (
        <div className={styles.maContainer}>
            <div className={styles.createRow}>
                <div>
                    <h3 className={styles.maTableTitle}>Home Page Background Images</h3>
                    <p className={styles.maTableSub}>Manage the rotating background images on the main hero section</p>
                </div>
                <button className="btn btn-primary" onClick={addImageSlot}>
                    ➕ Add Image Slot
                </button>
            </div>

            <div className={styles.imageSlotsContainer}>
                {editData.bgImages.map((image, index) => (
                    <div key={index} className={styles.imageSlotCard}>
                        <div className={styles.imageSlotHeader}>
                            <h4>Background Image {index + 1}</h4>
                            {editData.bgImages.length > 1 && (
                                <button 
                                    className="btn btn-ghost btn-sm text-red"
                                    onClick={() => removeImageSlot(index)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        
                        <ImageUpload
                            currentImage={image}
                            onImageChange={(imageUrl) => handleImageChange(index, imageUrl)}
                            label={`Background Image ${index + 1}`}
                            maxSizeMB={5}
                            aspectRatio="video"
                            supportedFormats={["image", "url"]}
                        />
                    </div>
                ))}
                
                {editData.bgImages.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🖼️</div>
                        <p>No background images added yet</p>
                        <button className="btn btn-outline" onClick={addImageSlot}>
                            Add First Image
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.formBtns}>
                <button className="btn btn-outline" onClick={() => setEditData({ bgImages: [...(homeContent?.bgImages || [])] })}>
                    Reset Changes
                </button>
                <button className="btn btn-primary" onClick={save}>
                    Save Background Images
                </button>
            </div>
        </div>
    );
}
