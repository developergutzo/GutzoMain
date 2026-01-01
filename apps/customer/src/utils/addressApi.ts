import {
  AddressApiResponse,
  AddressFormData,
  AddressListApiResponse,
  AddressType,
  AvailableTypesApiResponse,
  UserAddress,
} from "../types/address";
import { nodeApiService as apiService } from "./nodeApi";

export class AddressApi {
  static async getUserAddresses(
    userPhone: string,
  ): Promise<AddressListApiResponse> {
    try {
      if (!userPhone) {
        return { success: false, error: "User not authenticated" };
      }
      const response = await apiService.getUserAddresses(userPhone);
      return { success: true, data: response?.data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getDefaultAddress(
    userPhone: string,
  ): Promise<AddressApiResponse> {
    try {
      const addresses = await this.getUserAddresses(userPhone);
      if (!addresses.success) return { success: false, error: addresses.error };
      const defaultAddress = addresses.data?.find((addr) => addr.is_default);
      return { success: true, data: defaultAddress || undefined };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getAvailableAddressTypes(
    userPhone: string,
  ): Promise<AvailableTypesApiResponse> {
    try {
      if (!userPhone) {
        return { success: false, error: "User not authenticated" };
      }
      const types = await apiService.getAvailableAddressTypes(userPhone);
      return { success: true, data: (types.data as AddressType[]) || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async createAddress(
    addressData: AddressFormData,
    userPhone: string,
  ): Promise<AddressApiResponse> {
    try {
      if (!userPhone) {
        return { success: false, error: "User not authenticated" };
      }
      const result = await apiService.createAddress(userPhone, addressData);
      // Result is { success: true, data: address_object }
      return { success: true, data: result.data || result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async updateAddress(
    addressId: string,
    addressData: Partial<AddressFormData>,
    userPhone: string,
  ): Promise<AddressApiResponse> {
    try {
      if (!userPhone) {
        return { success: false, error: "User not authenticated" };
      }
      const result = await apiService.updateAddress(
        userPhone,
        addressId,
        addressData,
      );
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async deleteAddress(
    addressId: string,
    userPhone: string,
  ): Promise<AddressApiResponse> {
    try {
      if (!userPhone) {
        return { success: false, error: "User not authenticated" };
      }
      const result = await apiService.deleteAddress(userPhone, addressId);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async setDefaultAddress(
    addressId: string,
    userPhone: string,
  ): Promise<AddressApiResponse> {
    try {
      if (!userPhone) {
        return { success: false, error: "User not authenticated" };
      }
      const result = await apiService.setDefaultAddress(userPhone, addressId);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static getAddressDisplayText(address: UserAddress): string {
    const parts = [];

    // 1. Street (e.g., "2/287" or "Flat 4B")
    if (address.street) {
      parts.push(address.street);
    }

    // 2. Area (e.g., "Teachers Colony")
    // Only add if it's not identical to street and not contained in street
    if (
      address.area && address.area !== address.street &&
      !address.street.includes(address.area)
    ) {
      parts.push(address.area);
    }

    // 3. City (e.g., "Coimbatore")
    // Always good to have for context, unless it's already in the area (rare but possible)
    if (
      address.city &&
      !parts.some((p) => p.toLowerCase().includes(address.city.toLowerCase()))
    ) {
      parts.push(address.city);
    }

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return address.full_address || "";
  }

  static getAddressTypeInfo(type: AddressType, customTag?: string) {
    switch (type.toLowerCase()) {
      case "home":
        return { label: "Home", icon: "🏠" };
      case "work":
        return { label: "Work", icon: "🏢" };
      case "other":
        return { label: customTag || "Other", icon: "📍" };
      default:
        return { label: "Unknown", icon: "📍" };
    }
  }
}
