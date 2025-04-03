import { BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import Image from "next/image";

interface HomeProps {
  home: any;
  provider: BrowserProvider;
  account: string;
  escrow: any;
  togglePop: () => void;
}

const Home: React.FC<HomeProps> = ({
  home,
  provider,
  account,
  escrow,
  togglePop,
}) => {
  const [hasBought, setHasBought] = useState(false);
  const [hasLended, setHasLended] = useState(false);
  const [hasInspected, setHasInspected] = useState(false);
  const [hasSold, setHasSold] = useState(false);

  const [buyer, setBuyer] = useState<string | null>(null);
  const [lender, setLender] = useState<string | null>(null);
  const [inspector, setInspector] = useState<string | null>(null);
  const [seller, setSeller] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const buyer = await escrow.buyer(home.id);
      setBuyer(buyer);
      setHasBought(await escrow.approval(home.id, buyer));

      const seller = await escrow.seller();
      setSeller(seller);
      setHasSold(await escrow.approval(home.id, seller));

      const lender = await escrow.lender();
      setLender(lender);
      setHasLended(await escrow.approval(home.id, lender));

      const inspector = await escrow.inspector();
      setInspector(inspector);
      setHasInspected(await escrow.inspectionPassed(home.id));
    };

    const fetchOwner = async () => {
      if (await escrow.isListed(home.id)) return;
      setOwner(await escrow.buyer(home.id));
    };

    fetchDetails();
    fetchOwner();
  }, [hasSold]);

  const buyHandler = async () => {
    const escrowAmount = await escrow.escrowAmount(home.id);
    const signer = provider.getSigner();
    let transaction = await escrow
      .connect(signer)
      .depositEarnest(home.id, { value: escrowAmount });
    await transaction.wait();
    transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();
    setHasBought(true);
  };

  const inspectHandler = async () => {
    const signer = provider.getSigner();
    const transaction = await escrow
      .connect(signer)
      .updateInspectionStatus(home.id, true);
    await transaction.wait();
    setHasInspected(true);
  };

  const lendHandler = async () => {
    const signer = await provider.getSigner(); // ✅ Await the signer

    let transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();

    const lendAmount =
      (await escrow.purchasePrice(home.id)) -
      (await escrow.escrowAmount(home.id));

    await signer.sendTransaction({
      // ✅ This will now work
      to: escrow.address,
      value: lendAmount.toString(),
      gasLimit: 60000,
    });

    setHasLended(true);
  };

  const sellHandler = async () => {
    const signer = provider.getSigner();
    let transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();
    transaction = await escrow.connect(signer).finalizeSale(home.id);
    await transaction.wait();
    setHasSold(true);
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-black bg-opacity-50 fixed top-0 left-0">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{home.name}</h1>
          <button onClick={togglePop}>
            <Image
              src={"/assets/close.svg"}
              alt="close"
              width={10}
              height={10}
            />
          </button>
        </div>
        <img
          src={home.image}
          alt="Home"
          className="w-full h-64 object-cover rounded-md mt-4"
        />
        <p className="mt-2 text-gray-700">
          <strong>{home.attributes[2].value}</strong> bds |{" "}
          <strong>{home.attributes[3].value}</strong> ba |{" "}
          <strong>{home.attributes[4].value}</strong> sqft
        </p>
        <p className="text-gray-600">{home.address}</p>
        <h2 className="text-xl font-semibold mt-2">
          {home.attributes[0].value} ETH
        </h2>
        {owner ? (
          <p className="text-green-600 font-bold">
            Owned by {owner.slice(0, 6) + "..." + owner.slice(38, 42)}
          </p>
        ) : (
          <div className="mt-4">
            {account === inspector ? (
              <button
                onClick={inspectHandler}
                disabled={hasInspected}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Approve Inspection
              </button>
            ) : account === lender ? (
              <button
                onClick={lendHandler}
                disabled={hasLended}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                Approve & Lend
              </button>
            ) : account === seller ? (
              <button
                onClick={sellHandler}
                disabled={hasSold}
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
              >
                Approve & Sell
              </button>
            ) : (
              <button
                onClick={buyHandler}
                disabled={hasBought}
                className="bg-purple-500 text-white px-4 py-2 rounded"
              >
                Buy
              </button>
            )}
            <button className="bg-gray-500 text-white px-4 py-2 rounded ml-2">
              Contact agent
            </button>
          </div>
        )}
        <hr className="my-4" />
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-gray-600">{home.description}</p>
        <hr className="my-4" />
        <h2 className="text-lg font-semibold">Facts and features</h2>
        <ul className="list-disc list-inside text-gray-600">
          {home.attributes.map((attribute: any, index: number) => (
            <li key={index}>
              <strong>{attribute.trait_type}</strong>: {attribute.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
