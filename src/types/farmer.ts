export interface FarmerData {
    id?: number;
    name: string;
    phone: string;
    district: string;
    region: string;
    village?: string; // For backend compatibility
    plots: any[];
}
