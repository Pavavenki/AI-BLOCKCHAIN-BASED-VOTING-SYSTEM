export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Secure Blockchain Voting System
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Powered by blockchain technology for maximum security and transparency
          </p>
        </div>
      </div>
    </footer>
  );
}