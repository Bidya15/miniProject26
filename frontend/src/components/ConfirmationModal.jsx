import React from 'react';
import { useApp } from '../context/AppContext';
import './ConfirmationModal.css';

export default function ConfirmationModal() {
    const { confirmState } = useApp();

    if (!confirmState.show) return null;

    return (
        <div className="modal-overlay reveal">
            <div className="modal-content glass confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="confirm-icon">❓</div>
                <div className="confirm-header">
                    <h2 className="confirm-title">{confirmState.title || "Are you sure?"}</h2>
                    <p className="confirm-msg">{confirmState.message || "This action cannot be undone."}</p>
                </div>
                <div className="confirm-footer">
                    <button 
                        className="btn btn-outline" 
                        onClick={() => confirmState.onResolve(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => confirmState.onResolve(true)}
                    >
                        Yes, Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}
