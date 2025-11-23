/**
 * Business configuration and constants
 */

export const BUSINESS_INFO = {
    name: "Taqueria El Indio",

    description: "Taqueria El Indio ofrece auténticos tacos mexicanos con carne asada, pastor, suadero y las mejores salsas caseras de la ciudad.",

    // Contact Information
    phones: [
        { number: "3317101407", display: "331 710 1407" },

    ],

    // Location
    address: {
        street: "C. Hidalgo 1",
        neighborhood: "Lopez Cotilla",
        city: "San Pedro Tlaquepaque",
        state: "Jalisco",
        country: "México",
        fullAddress: "C. Hidalgo 1, Lopez Cotilla, San Pedro Tlaquepaque, Jalisco"
    },

    // Google Maps coordinates (approximate - should be updated with exact location)
    location: {
        lat: 20.57311188096468,
        lng: -103.35935916204993,
        mapUrl: "https://www.google.com/maps/search/?api=1&query=C. Hidalgo+1"
    },

    // Business Hours
    hours: {

        saturday: "7:00 PM - 11:00 PM",
        sunday: "7:00 PM - 11:00 PM"
    },

    // Bank Account for Transfers
    bankAccount: {
        accountHolder: "Sandra Paulina Romero Nolasco",
        bank: "",
        clabe: "000000000000000000"
    },

    // Social Media (optional - add as needed)
    social: {
        facebook: "",
        instagram: "",
        twitter: ""
    }
} as const;

export const APP_CONFIG = {
    orderRefreshInterval: 5000, // 5 seconds
    defaultOrderType: "LOCAL",
    currency: "MXN",
    currencySymbol: "$"
} as const;
