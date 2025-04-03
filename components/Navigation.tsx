import { ethers } from "ethers";
import Image from "next/image";
import Link from "next/link";

interface NavigationProps {
  account: string | null;
  setAccount: (account: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ account, setAccount }) => {
  const connectHandler = async () => {
    if (window.ethereum) {
      try {
        const accounts: string[] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="flex space-x-4 text-lg">
        <Link href="#" className="hover:text-blue-500">
          Buy
        </Link>

        <Link href="#" className="hover:text-blue-500">
          Rent
        </Link>

        <Link href="#" className="hover:text-blue-500">
          Sell
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <Image src={"/assets/logo.svg"} alt="Logo" width={100} height={100} />
        <h1 className="text-xl font-semibold">Millow</h1>
      </div>

      {account ? (
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          {account.slice(0, 6) + "..." + account.slice(-4)}
        </button>
      ) : (
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={connectHandler}
        >
          Connect
        </button>
      )}
    </nav>
  );
};

export default Navigation;
