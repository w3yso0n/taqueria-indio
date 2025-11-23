/**
 * Business configuration and constants
 */

export const BUSINESS_INFO = {
    name: "ElToldito",

    description: "ElToldito es un restaurante de mariscos que ofrece una experiencia culinaria única y memorable para sus clientes.",

    // Contact Information
    phones: [
        { number: "3310173405", display: "331 017 3405" },
        { number: "3311955259", display: "331 195 5259" }
    ],

    // Location
    address: {
        street: "Incalpa No. 42 A",
        neighborhood: "Manuel Lopez Cotilla",
        city: "Guadalajara",
        state: "Jalisco",
        country: "México",
        fullAddress: "Incalpa No. 42 A, Manuel Lopez Cotilla, Guadalajara, Jalisco"
    },

    // Google Maps coordinates (approximate - should be updated with exact location)
    location: {
        lat: 20.574342386570986,
        lng: -103.35768786706652,
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Incalpa+42"
    },

    // Business Hours
    hours: {
        monday: "9:00 AM - 9:00 PM",
        tuesday: "9:00 AM - 9:00 PM",
        wednesday: "9:00 AM - 9:00 PM",
        thursday: "9:00 AM - 9:00 PM",
        friday: "9:00 AM - 10:00 PM",
        saturday: "10:00 AM - 10:00 PM",
        sunday: "10:00 AM - 8:00 PM"
    },

    // Bank Account for Transfers
    bankAccount: {
        accountHolder: "Carlos Antonio Flores Contreras",
        bank: "Nu",
        clabe: "638180000134558011"
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
