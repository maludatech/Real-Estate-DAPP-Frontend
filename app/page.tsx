"use client";

import { useEffect, useState } from "react";
import { ethers, Contract } from "ethers";

// Components
import Navigation from "@/components/Navigation";
import Search from "@/components/Search";
import Home from "@/components/Home";

// ABIs
import RealEstate from "@/libs/abis/RealEstate.json";
import Escrow from "@/libs/abis/Escrow.json";

// Config
import config from "@/config.json";

interface HomeType {
  image: string;
  address: string;
  attributes: { trait_type: string; value: string | number }[];
}

const App: React.FC = () => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [escrow, setEscrow] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [homes, setHomes] = useState<HomeType[]>([]);
  const [home, setHome] = useState<HomeType | null>(null);
  const [toggle, setToggle] = useState<boolean>(false);

  const loadBlockchainData = async () => {
    if (!window.ethereum) return;

    const providerInstance = new ethers.JsonRpcProvider(window.ethereum);
    setProvider(providerInstance);

    const network = await providerInstance.getNetwork();
    const realEstate = new Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      providerInstance
    );

    const totalSupply = await realEstate.totalSupply();
    const homesData: HomeType[] = [];

    for (let i = 1; i <= totalSupply; i++) {
      const uri: string = await realEstate.tokenURI(i);
      const response = await fetch(uri);
      const metadata: HomeType = await response.json();
      homesData.push(metadata);
    }

    setHomes(homesData);

    const escrowInstance = new Contract(
      config[network.chainId].escrow.address,
      Escrow,
      providerInstance
    );
    setEscrow(escrowInstance);

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(ethers.utils.getAddress(accounts[0]));
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const togglePop = (selectedHome: HomeType) => {
    setHome(selectedHome);
    setToggle((prev) => !prev);
  };

  return (
    <div className="p-4">
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className="mt-6">
        <h3 className="text-xl font-semibold">Homes For You</h3>
        <hr className="my-2" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {homes.map((home, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden shadow-md cursor-pointer"
              onClick={() => togglePop(home)}
            >
              <div className="w-full h-64">
                <img
                  src={home.image}
                  alt="Home"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="text-lg font-bold">
                  {home.attributes[0].value} ETH
                </h4>
                <p className="text-gray-600">
                  <strong>{home.attributes[2].value}</strong> bds |{" "}
                  <strong>{home.attributes[3].value}</strong> ba |{" "}
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p className="text-gray-500">{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toggle && home && (
        <Home
          home={home}
          provider={provider}
          account={account}
          escrow={escrow}
          togglePop={togglePop}
        />
      )}
    </div>
  );
};

export default App;
