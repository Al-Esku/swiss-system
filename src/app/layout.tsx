import React from "react";
import {Metadata} from "next";
import "../index.css"

export const metadata: Metadata = {
    title: "Swiss Competition System",
    description: "Web site created using create-react-app",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    )
}