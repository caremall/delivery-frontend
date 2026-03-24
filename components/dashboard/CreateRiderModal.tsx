"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, UserPlus, Info, CreditCard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateRiderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateRiderModal = ({ isOpen, onClose }: CreateRiderModalProps) => {
    const queryClient = useQueryClient();
    const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("");
    const [upiType, setUpiType] = useState<"id" | "number">("id");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            status: "active",
            avatar: "",
            kyc: {
                drivingLicence: "",
                status: "approved", // Admin creation defaults to approved
            },
            bankDetails: {
                paymentMode: "",
                accountHolderName: "",
                accountNumber: "",
                ifscCode: "",
                bankName: "",
                upiId: "",
                upiNumber: "",
            }
        },
    });

    const mutation = useMutation({
        mutationFn: (data: any) => axiosInstance.post("/riders/create", data),
        onSuccess: () => {
            toast.success("Rider created successfully!");
            queryClient.invalidateQueries({ queryKey: ["riders"] });
            reset();
            setSelectedPaymentMode("");
            setUpiType("id");
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create rider");
        },
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    // Reset local state when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setSelectedPaymentMode("");
            setUpiType("id");
        }
    }, [isOpen, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 rounded-2xl overflow-hidden border-none shadow-2xl">
                <DialogHeader className="bg-gray-900 px-8 py-6 text-white text-left">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="h-6 w-6 text-red-500" />
                        Professional Rider Registration
                    </DialogTitle>
                    <p className="text-xs text-gray-400 mt-1">
                        Register a new rider with complete profile, KYC, and payment information.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white">
                    <div className="px-8 py-6 h-[70vh] overflow-y-auto space-y-8 CustomScrollbar">
                        {/* Section 1: General Info */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 tracking-widest border-b border-gray-100 pb-2">
                                <Info className="h-3.5 w-3.5" /> General Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase text-gray-400 tracking-wider">Full name *</Label>
                                    <Input
                                        {...register("name", {
                                            required: "Name is required",
                                            minLength: { value: 2, message: "Name must be at least 2 characters" },
                                            pattern: { value: /^[A-Za-z\s]+$/, message: "Name can only contain letters and spaces" }
                                        })}
                                        placeholder="Enter full name"
                                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50"
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500 font-medium">{errors.name?.message as string}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase text-gray-400 tracking-wider">Mobile Number *</Label>
                                    <Input
                                        {...register("phone", {
                                            required: "Phone is required",
                                            pattern: { value: /^[6-9][0-9]{9}$/, message: "Must be a valid 10-digit Indian number" }
                                        })}
                                        type="tel"
                                        placeholder="10 digit number"
                                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50"
                                    />
                                    {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone?.message as string}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase text-gray-400 tracking-wider">Email *</Label>
                                    <Input
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address"
                                            }
                                        })}
                                        type="email"
                                        placeholder="rider@example.com"
                                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50"
                                    />
                                    {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email?.message as string}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase text-gray-400 tracking-wider">Avatar URL</Label>
                                    <Input
                                        {...register("avatar")}
                                        placeholder="https://image-url.com"
                                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: KYC Details */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 tracking-widest border-b border-gray-100 pb-2">
                                <ShieldCheck className="h-3.5 w-3.5" /> Documentation (KYC)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase text-gray-400 tracking-wider">Driving Licence URL</Label>
                                    <Input
                                        {...register("kyc.drivingLicence")}
                                        placeholder="DL Image URL"
                                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-medium uppercase text-gray-400 tracking-wider">KYC Status</Label>
                                    <Select
                                        defaultValue="approved"
                                        onValueChange={(val) => setValue("kyc.status", val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="approved">Approved (Default)</SelectItem>
                                            <SelectItem value="under_review">Under Review</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Bank / Payment Info */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 tracking-widest border-b border-gray-100 pb-2">
                                <CreditCard className="h-3.5 w-3.5" /> Payment & Bank Details <span className="text-red-500 ml-1">*</span>
                            </h4>
                            <div className="space-y-6">
                                <div className="space-y-1.5 max-w-xs">
                                    <Label className="text-[10px] font-medium uppercase text-gray-400 tracking-wider">Payment Mode *</Label>
                                    <Select
                                        onValueChange={(val) => {
                                            setSelectedPaymentMode(val);
                                            setValue("bankDetails.paymentMode", val, { shouldValidate: true });
                                        }}
                                        value={selectedPaymentMode}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50">
                                            <SelectValue placeholder="Select Payment Mode" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="bank">Bank Account</SelectItem>
                                            <SelectItem value="upi">UPI (GPay / PhonePe)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <input 
                                        type="hidden" 
                                        {...register("bankDetails.paymentMode", { required: "Payment mode is required" })} 
                                    />
                                    {(errors.bankDetails as any)?.paymentMode && (
                                        <p className="text-[10px] text-red-500 font-medium">{(errors.bankDetails as any).paymentMode.message}</p>
                                    )}
                                </div>

                                {selectedPaymentMode === 'bank' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-medium uppercase text-gray-400">Account Holder Name *</Label>
                                            <Input 
                                                {...register("bankDetails.accountHolderName", { 
                                                    required: selectedPaymentMode === 'bank' ? "Holder name is required" : false,
                                                    pattern: { value: /^[a-zA-Z\s]+$/, message: "Only letters and spaces allowed" },
                                                    minLength: { value: 3, message: "Min 3 characters" },
                                                    maxLength: { value: 100, message: "Max 100 characters" }
                                                })} 
                                                placeholder="As per bank records"
                                                className="bg-white h-11 rounded-xl" 
                                            />
                                            {(errors.bankDetails as any)?.accountHolderName && (
                                                <p className="text-[10px] text-red-500 font-medium">{(errors.bankDetails as any).accountHolderName.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-medium uppercase text-gray-400">Bank Name *</Label>
                                            <Input 
                                                {...register("bankDetails.bankName", { 
                                                    required: selectedPaymentMode === 'bank' ? "Bank name is required" : false 
                                                })} 
                                                placeholder="e.g. HDFC Bank"
                                                className="bg-white h-11 rounded-xl" 
                                            />
                                            {(errors.bankDetails as any)?.bankName && (
                                                <p className="text-[10px] text-red-500 font-medium">{(errors.bankDetails as any).bankName.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-medium uppercase text-gray-400">Account Number *</Label>
                                            <Input 
                                                {...register("bankDetails.accountNumber", { 
                                                    required: selectedPaymentMode === 'bank' ? "Account number is required" : false,
                                                    pattern: { value: /^[0-9]{9,18}$/, message: "Must be 9-18 digits" }
                                                })} 
                                                placeholder="9-18 digit number"
                                                className="bg-white h-11 rounded-xl" 
                                            />
                                            {(errors.bankDetails as any)?.accountNumber && (
                                                <p className="text-[10px] text-red-500 font-medium">{(errors.bankDetails as any).accountNumber.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-medium uppercase text-gray-400">IFSC Code *</Label>
                                            <Input 
                                                {...register("bankDetails.ifscCode", { 
                                                    required: selectedPaymentMode === 'bank' ? "IFSC code is required" : false,
                                                    pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: "Format: AAAA0XXXXXX" }
                                                })} 
                                                onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase()}
                                                placeholder="AAAA0XXXXXX"
                                                className="bg-white h-11 rounded-xl" 
                                            />
                                            {(errors.bankDetails as any)?.ifscCode && (
                                                <p className="text-[10px] text-red-500 font-medium">{(errors.bankDetails as any).ifscCode.message}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedPaymentMode === 'upi' && (
                                    <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUpiType('id');
                                                    setValue("bankDetails.upiNumber", "");
                                                }}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                                                    upiType === 'id'
                                                        ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200"
                                                        : "bg-white text-gray-400 border-gray-200 hover:bg-gray-100"
                                                )}
                                            >
                                                UPI ID
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUpiType('number');
                                                    setValue("bankDetails.upiId", "");
                                                }}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                                                    upiType === 'number'
                                                        ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200"
                                                        : "bg-white text-gray-400 border-gray-200 hover:bg-gray-100"
                                                )}
                                            >
                                                UPI Number
                                            </button>
                                        </div>

                                        <div className="space-y-1.5 animate-in slide-in-from-bottom-2 duration-300">
                                            {upiType === 'id' ? (
                                                <>
                                                    <Label className="text-[10px] font-medium uppercase text-gray-400">UPI ID *</Label>
                                                    <Input
                                                        {...register("bankDetails.upiId", {
                                                            required: upiType === 'id' ? "UPI ID is required" : false
                                                        })}
                                                        placeholder="username@bank"
                                                        className="bg-white h-11 rounded-xl"
                                                    />
                                                    {(errors.bankDetails as any)?.upiId && (
                                                        <p className="text-[10px] text-red-500 font-medium">{(errors.bankDetails as any).upiId.message}</p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <Label className="text-[10px] font-medium uppercase text-gray-400">UPI Number *</Label>
                                                    <Input
                                                        {...register("bankDetails.upiNumber", {
                                                            required: upiType === 'number' ? "UPI Number is required" : false,
                                                            pattern: { value: /^[6-9][0-9]{9}$/, message: "Must be a valid 10-digit Indian number" }
                                                        })}
                                                        placeholder="Enter 10-digit number"
                                                        className="bg-white h-11 rounded-xl"
                                                    />
                                                    {(errors.bankDetails as any)?.upiNumber && (
                                                        <p className="text-[10px] text-red-500 font-medium">{(errors.bankDetails as any).upiNumber.message}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl font-bold text-gray-500 hover:bg-gray-200 h-12 px-6"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="rounded-xl font-bold bg-[#dc2626] hover:bg-red-700 text-white h-12 px-10 shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {mutation.isPending ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                            ) : "Create Professional Profile"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
