import { HeaderMenu } from "../components/header/HeaderMenu";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HeaderMenu />
      <div className="container mx-auto px-4 py-4">{children}</div>
    </>
  );
}


