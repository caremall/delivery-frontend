"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useFormContext, Controller } from "react-hook-form"
import { X, Camera, UploadCloud, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Image from "next/image"

type ImageUploadProps = {
    name: string
    label: string
    mode?: "single" | "multi" | "avatar"
    placeholder?: string
    size?: "sm" | "md" | "lg" | "xl"
}

const avatarSizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
    xl: "w-44 h-44",
}

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

export const ImageUploadInput = ({
    name,
    label,
    mode = "single",
    placeholder,
    size = "lg",
}: ImageUploadProps) => {
    const { control } = useFormContext()
    const [isDragOver, setIsDragOver] = useState(false)
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    /* ---------- FILE HANDLER ---------- */
    const handleFiles = useCallback(
        (files: FileList | null, fieldValue: any, onChange: (value: any) => void) => {
            if (!files) return

            const validFiles: File[] = []

            for (const file of Array.from(files)) {
                if (!ALLOWED_TYPES.includes(file.type)) {
                    toast.error(`${file.name} is not a supported image format`)
                    continue
                }

                if (file.size > MAX_SIZE) {
                    toast.error(`${file.name} exceeds 5MB limit`)
                    continue
                }

                validFiles.push(file)
            }

            if (!validFiles.length) return

            if (mode !== "multi") {
                previewUrls.forEach((url) => {
                    if (url.startsWith("blob:")) URL.revokeObjectURL(url)
                })
            }

            const newPreviews = validFiles.map((f) => URL.createObjectURL(f))

            if (mode === "multi") {
                const existingFiles = Array.isArray(fieldValue) ? fieldValue : []
                setPreviewUrls((prev) => [...prev, ...newPreviews])
                onChange([...existingFiles, ...validFiles])
            } else {
                setPreviewUrls([newPreviews[0]])
                onChange(validFiles[0])
            }
        },
        [mode, previewUrls],
    )

    /* ---------- REMOVE IMAGE ---------- */
    const removeImage = useCallback(
        (index: number, fieldValue: any, onChange: (value: any) => void) => {
            const files = Array.isArray(fieldValue) ? fieldValue : fieldValue ? [fieldValue] : []

            if (previewUrls[index]?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrls[index])
            }

            const updatedPreviews = previewUrls.filter((_, i) => i !== index)
            const updatedFiles = files.filter((_: any, i: number) => i !== index)

            setPreviewUrls(updatedPreviews)

            if (mode === "multi") {
                onChange(updatedFiles)
            } else {
                onChange(null)
                setPreviewUrls([])
            }
        },
        [previewUrls, mode],
    )

    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => {
                if (url.startsWith("blob:")) URL.revokeObjectURL(url)
            })
        }
    }, [])

    const getInitials = useCallback(() => {
        if (!placeholder) return "?"
        return placeholder
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
    }, [placeholder])

    const renderAvatarMode = (field: any, fieldState: any) => {
        const avatarUrl = previewUrls[0] || (typeof field.value === "string" ? field.value : "")

        return (
            <div className="space-y-4">
                <Label className="text-base font-medium">{label}</Label>
                <div id={name} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="relative group cursor-pointer transition-all duration-300 hover:scale-105">
                        <label className="cursor-pointer block relative">
                            <Avatar className={cn(avatarSizeClasses[size], "border-4 border-white shadow-xl ring-1 ring-slate-200/50 transition-transform")}>
                                <AvatarImage src={avatarUrl} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold bg-slate-100 text-slate-400">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>

                            <div className={cn(
                                "absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200",
                                avatarUrl ? "bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px]" : "bg-slate-100/50 opacity-100"
                            )}>
                                <Camera className={cn("w-8 h-8", avatarUrl ? "text-white" : "text-slate-400")} />
                            </div>

                            <input
                                type="file"
                                accept={ALLOWED_TYPES.join(",")}
                                className="sr-only"
                                onChange={(e) => handleFiles(e.target.files, field.value, field.onChange)}
                            />
                        </label>

                        {avatarUrl && (
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute -top-1 -right-1 w-8 h-8 rounded-full shadow-lg border-2 border-white hover:bg-red-600 transition-colors z-10"
                                onClick={(e) => {
                                    e.preventDefault()
                                    removeImage(0, field.value, field.onChange)
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground font-medium">Click to upload photo</p>
                </div>
                {fieldState.error && <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>}
            </div>
        )
    }

    const renderDropZone = (multiple: boolean, field: any, fieldState: any) => (
        <div className="w-full space-y-4">
            <div id={name} className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{label}</Label>
                {multiple && previewUrls.length > 0 && (
                    <span className="text-xs text-muted-foreground">{previewUrls.length} file{previewUrls.length !== 1 && 's'} selected</span>
                )}
            </div>

            <div className="space-y-4">
                <label
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out group overflow-hidden",
                        isDragOver
                            ? "border-red-500 bg-red-50 ring-4 ring-red-500/10"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-red-500/50",
                        fieldState.error && "border-red-500 bg-red-50/10"
                    )}
                    onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault()
                        setIsDragOver(false)
                        handleFiles(e.dataTransfer.files, field.value, field.onChange)
                    }}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center space-y-2 z-10 p-4">
                        <div className={cn(
                            "p-4 rounded-full bg-white shadow-sm ring-1 ring-slate-200 mb-2 group-hover:scale-110 transition-transform duration-200",
                            isDragOver && "bg-red-50 text-red-500 ring-red-500/20"
                        )}>
                            <UploadCloud className={cn("w-6 h-6 text-slate-500", isDragOver && "text-red-500")} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">
                                <span className="text-red-600 hover:underline">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                PNG, JPG or WEBP (max. 5MB)
                            </p>
                        </div>
                    </div>

                    <input
                        type="file"
                        accept={ALLOWED_TYPES.join(",")}
                        multiple={multiple}
                        className="sr-only"
                        onChange={(e) => handleFiles(e.target.files, field.value, field.onChange)}
                    />
                </label>

                {previewUrls.length > 0 && (
                    <div className={cn(
                        "grid gap-4",
                        multiple ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"
                    )}>
                        {previewUrls.map((url, i) => (
                            <div key={url + i} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all">
                                <Image
                                    src={url}
                                    alt={`Preview ${i}`}
                                    fill
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8 shadow-sm"
                                        onClick={() => removeImage(i, field.value, field.onChange)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {fieldState.error && <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>}
        </div>
    )

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => {
                useEffect(() => {
                    if (!field.value) {
                        if (previewUrls.length > 0) setPreviewUrls([])
                        return
                    }

                    if (Array.isArray(field.value)) {
                        const newUrls = field.value.map((item: any) => {
                            if (item instanceof File) {
                                return URL.createObjectURL(item)
                            } else if (typeof item === "string") {
                                return item
                            }
                            return ""
                        }).filter(Boolean)

                        setPreviewUrls(newUrls)
                    }
                    else if (field.value instanceof File) {
                        setPreviewUrls([URL.createObjectURL(field.value)])
                    }
                    else if (typeof field.value === "string") {
                        setPreviewUrls([field.value])
                    }
                }, [field.value])

                if (mode === "avatar") return renderAvatarMode(field, fieldState)
                if (mode === "multi") return renderDropZone(true, field, fieldState)
                return renderDropZone(false, field, fieldState)
            }}
        />
    )
}
