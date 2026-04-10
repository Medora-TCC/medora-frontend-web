interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (<main className="min-h-screen min-w-screen antialiased lg:max-w-7xl mx-auto w-full">{children}</main>)
}