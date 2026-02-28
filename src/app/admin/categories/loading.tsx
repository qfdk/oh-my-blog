"use client";

export default function Loading() {
    return (
        <div className="content-loading-card">
            <div className="content-spinner">
                <div className="content-spinner-ring"></div>
                <div className="content-spinner-center"></div>
            </div>
            <div className="content-spinner-text">载入中...</div>
        </div>
    );
}
