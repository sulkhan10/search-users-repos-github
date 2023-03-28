import { useState, useEffect } from "react";
import { Octokit } from "octokit";
import "./App.css"
import { AiFillStar } from 'react-icons/ai'

const octokit = new Octokit({
  auth: process.env.REACT_APP_GITHUB_TOKEN,
});


function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [repoDropdown, setRepoDropdown] = useState<{ [key: string]: boolean }>(
    {}
  );

  const searchUsers = async () => {
    const { data } = await octokit.rest.search.users({
      q: searchQuery,
      per_page: 5,
      page: currentPage,
    });
    if (data.total_count<=30) {
      setPages(Math.ceil(data.total_count / 5));
    }else{setPages(6)}
    const users: any = await Promise.all(
      data.items.map(async (item: any) => {
        const { data } = await octokit.rest.repos.listForUser({
          username: item.login,
        });
        return { name: item.login, repos: data };
      })
    );
    setUsers(users);
    setRepoDropdown({});
  };

  const handleSearchQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const toggleRepoDropdown = (name: string) => {
    setRepoDropdown((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    searchUsers();
  }, [currentPage]);

  return (
    <div className="container mx-5 my-5">
      <div className="mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchQueryChange}
          className="px-4 py-2 border border-gray-400 rounded-md w-full"
          placeholder="Search username"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full my-4"
          onClick={searchUsers}
        >
          Search
        </button>
      </div>
      {users.map((user: any) => (
        <div key={user.name} className="bg-white rounded-lg shadow-md my-3">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">{user.name}</h2>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md"
              onClick={() => toggleRepoDropdown(user.name)}
            >
              {repoDropdown[user.name] ? "Hide Repos" : "Show Repos"}
            </button>
          </div>
          {repoDropdown[user.name] && (
            <div className="px-4 py-2">
              {user.repos.map((repo: any) => (
                <div key={repo.name} className="py-2">
                  <div className="flex justify-between w-full">
                    <div>
                      <a href={repo.html_url} className="text-blue-500 ">
                        {repo.name}
                      </a>
                    </div>
                    <div className="flex items-center">
                    <AiFillStar/>
                      <p>{` `} {repo.stargazers_count}</p>
                      </div>
                  </div>
                  <p>{` `}{repo.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {users.length !== 0 && (<div className="flex justify-center w-full">
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md mr-2 ${
            currentPage === 1 && "opacity-50 cursor-not-allowed"
          }`}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {[...Array(pages)].map((_, index) => (
          <button
            key={index}
            className={`bg-white hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md mx-1 ${
              index + 1 == currentPage && "bg-sky-300 text-gray-500"
            }`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md ml-2 ${
            users.length < 5 && "opacity-50 cursor-not-allowed"
          }`}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={users.length < 5}
        >
          Next
        </button>
      </div>)}
      
    </div>
  );
}

export default App;
