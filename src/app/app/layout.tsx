import "~/styles/globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="flex flex-col min-h-screen dark bg-black">
          {children}
        </div>
      </body>
    </html>
  );
}
