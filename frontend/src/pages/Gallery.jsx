import { useState } from "react";
import { useApp } from "../context/AppContext";
import PublicNav from "../components/PublicNav";
import Footer from "../components/Footer";
import ImageUpload from "../components/ImageUpload";
import styles from "./Gallery.module.css";

export default function Gallery() {
    const { galleryImages, updateGallery, currentUser, page } = useApp();
    const [selectedImg, setSelectedImg] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newItem, setNewItem] = useState({ url: "", title: "", category: "Campus", albumName: "", isVideo: false });
    const [mediaTab, setMediaTab] = useState("PHOTOS"); // PHOTOS or VIDEOS

    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN" && page === "APP";

    function addImage(e) {
        e.preventDefault();
        updateGallery({ url: newItem.url, title: newItem.title, category: newItem.category, albumName: newItem.albumName, isVideo: newItem.isVideo });
        setNewItem({ url: "", title: "", category: "Campus", albumName: "", isVideo: false });
        setShowAdd(false);
    }

    const handleDelete = async (id) => {
        if (await confirm("Remove Image?", "Are you sure you want to delete this photo from the gallery?")) {
            await updateGallery(galleryImages.filter(img => img.id !== id));
        }
    };

    return (
        <div className={page === "GALLERY" ? styles.publicPage : ""}>
            {page === "GALLERY" && <PublicNav activePage="GALLERY" />}

            <div className={styles.container}>
                <header className="page-header" style={{ marginBottom: 10 }}>
                    <div>
                        <h1 className="page-title">College Gallery</h1>
                        <p className="page-sub">Relive the memories and explore campus milestones</p>
                    </div>
                    {isSuper && (
                        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
                            {showAdd ? "✕ Cancel" : "+ Add Media"}
                        </button>
                    )}
                </header>

                <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                    <button
                        onClick={() => setMediaTab("PHOTOS")}
                        style={{ background: mediaTab === "PHOTOS" ? "#4f46e5" : "transparent", color: mediaTab === "PHOTOS" ? "#fff" : "#666", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                    >📸 Alumni Photo Albums</button>
                    <button
                        onClick={() => setMediaTab("VIDEOS")}
                        style={{ background: mediaTab === "VIDEOS" ? "#4f46e5" : "transparent", color: mediaTab === "VIDEOS" ? "#fff" : "#666", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                    >🎥 Video Albums</button>
                </div>

                {showAdd && isSuper && (
                    <form className={styles.addForm} onSubmit={addImage}>
                        <div className={styles.formGrid}>
                            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                <label className="form-label">
                                    <input type="checkbox" checked={newItem.isVideo} onChange={e => setNewItem({ ...newItem, isVideo: e.target.checked })} style={{ marginRight: 8 }} />
                                    This is a Video (Provide YouTube Embed URL or direct MP4 URL)
                                </label>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{newItem.isVideo ? "Video URL" : "Image File / URL"}</label>
                                {!newItem.isVideo ? (
                                    <ImageUpload
                                        currentImage={newItem.url}
                                        onImageChange={(url) => setNewItem({ ...newItem, url })}
                                        label="Upload Media"
                                        maxSizeMB={25}
                                        aspectRatio="free"
                                        supportedFormats={["image", "url"]}
                                    />
                                ) : (
                                    <input className="inp" required value={newItem.url} onChange={e => setNewItem({ ...newItem, url: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input className="inp" required value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} placeholder="Convocation 2024" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="inp" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                    <option>Campus</option>
                                    <option>Events</option>
                                    <option>Alumni Meet</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Album Name (Optional)</label>
                                <input className="inp" value={newItem.albumName} onChange={e => setNewItem({ ...newItem, albumName: e.target.value })} placeholder="e.g. Reunion 2023" />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Publish Media</button>
                    </form>
                )}

                <div className={styles.galleryGrid}>
                    {galleryImages.filter(img => mediaTab === "VIDEOS" ? img.isVideo : !img.isVideo).map(img => (
                        <div
                            key={img.id}
                            className={styles.galleryCard}
                            onClick={() => !img.isVideo && setSelectedImg(img)}
                        >
                            {isSuper && (
                                <button
                                    className={styles.deleteBtn}
                                    onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                                >
                                    ✕
                                </button>
                            )}
                            <div className={styles.imgWrapper}>
                                {img.isVideo ? (
                                    <iframe src={img.url} className={styles.galleryImg} frameBorder="0" allowFullScreen style={{ pointerEvents: isSuper ? 'none' : 'auto' }} />
                                ) : (
                                    <img src={img.url} alt={img.title} className={styles.galleryImg} />
                                )}
                            </div>
                            <div className={styles.cardContent}>
                                <span className={styles.categoryTag}>{img.albumName ? `${img.category} • ${img.albumName}` : img.category}</span>
                                <h3 className={styles.cardTitle}>{img.title}</h3>
                            </div>
                        </div>
                    ))}
                    {galleryImages.filter(img => mediaTab === "VIDEOS" ? img.isVideo : !img.isVideo).length === 0 && (
                        <div style={{ padding: "40px", textAlign: "center", gridColumn: "1 / -1", color: "#666" }}>
                            No {mediaTab === "VIDEOS" ? "videos" : "photos"} uploaded yet.
                        </div>
                    )}
                </div>

                {selectedImg && !selectedImg.isVideo && (
                    <div className={styles.lightbox} onClick={() => setSelectedImg(null)}>
                        <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                            <button className={styles.lightboxClose} onClick={() => setSelectedImg(null)}>✕</button>
                            <img src={selectedImg.url} alt={selectedImg.title} className={styles.lightboxImg} />
                            <div className={styles.lightboxCaption}>
                                <h3>{selectedImg.title}</h3>
                                <p>{selectedImg.albumName ? `${selectedImg.category} • ${selectedImg.albumName}` : selectedImg.category}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {page === "GALLERY" && <Footer />}
        </div>
    );
}
