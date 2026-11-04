export interface Address {
  id: string;
  fullName: string;
  streetAddress: string;
  apartmentOrSuite?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}
