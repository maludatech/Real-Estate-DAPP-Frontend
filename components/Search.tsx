const Search = () => {
  return (
    <header className="relative min-h-[40vh] bg-[url('/assets/houses.png')] bg-cover bg-center">
      <h2 className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center text-white text-2xl font-bold">
        Search it. Explore it. Buy it.
      </h2>
      <input
        type="text"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/5 p-4 text-lg font-semibold placeholder:text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Enter an address, neighborhood, city, or ZIP code"
      />
    </header>
  );
};

export default Search;
