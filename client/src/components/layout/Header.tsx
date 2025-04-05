import { Shield } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-center">
        <Shield className="h-8 w-8 text-white mr-3" />
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Secure Blockchain Voting
          </h1>
          <p className="text-blue-100 mt-1">
            Your vote is secure, transparent, and immutable
          </p>
        </div>
      </div>
    </header>
  );
}