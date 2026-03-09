import axiosInstance from "../axios";

export interface ReturnRequest {
    _id: string;
    returnId: string;
    order: {
        _id: string;
        orderId: string;
        orderStatus: string;
    };
    user: {
        name: string;
        email: string;
        phone: string;
    };
    item: {
        product: {
            productName: string;
            productImages: string[];
            SKU: string;
        };
        variant?: {
            variantAttributes: Array<{ name: string; value: string }>;
        };
    };
    status: string;
    returnType: string;
    updatedAt: string;
    rider?: {
        _id: string;
        name: string;
        phone: string;
        avatar?: string;
    };
}

export const getAssignedReturns = async (params: { status?: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get("/warehouse/returns/assigned", { params });
    return response.data;
};
