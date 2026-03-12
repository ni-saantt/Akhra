export interface FarmerData {
    id?: number;
    name: string;
    phone: string;
    district: string;
    region: string;
    village?: string; // For backend compatibility
    land_size: number;
    plots: any[];
}
