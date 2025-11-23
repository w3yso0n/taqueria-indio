import Link from "next/link"
import { ShoppingCart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-primary">ElToldito</span>
                    </Link>
                </div>

                {/* Placeholder for future nav items or mobile menu trigger */}
                <div className="flex items-center gap-4">
                    {/* This can be expanded based on context (client vs business) */}
                </div>
            </div>
        </header>
    )
}
