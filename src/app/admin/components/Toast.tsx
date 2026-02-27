"use client";

import { CircleCheck, CircleX } from "lucide-react";
import styles from "../admin.module.css";

interface ToastProps {
    type: "success" | "error";
    msg: string;
}

export default function Toast({ type, msg }: ToastProps) {
    return (
        <div className={`${styles.toast} ${type === "success" ? styles.toastSuccess : styles.toastError}`}>
            {type === "success" ? <CircleCheck size={16} /> : <CircleX size={16} />}
            {msg}
        </div>
    );
}
