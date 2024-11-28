"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./modal.module.scss";

interface ModalProps {
  children: React.ReactNode;
}

export default function Modal({ children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
      dialogRef.current?.scrollTo({
        top: 0,
      });
    }
  }, []);
  return (
    <dialog
      onClose={() => {
        // ESC key event -> close modal
        router.back();
      }}
      onClick={(e) => {
        // Click outside of modal -> close modal
        const target = e.target as HTMLElement;
        if (target.nodeName === "DIALOG") {
          router.back();
        }
      }}
      ref={dialogRef}
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 ${styles.modal}`}
    >
      {children}I
    </dialog>
  );
}
