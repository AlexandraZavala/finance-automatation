"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import StockCard from "./stock-card";
import callApi from "../../services/stock";
import {Company, Filters} from "./interfaces";

type FilterField = "marketCap" | "volume" | "sector";


export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    marketCap: { operator: ">=", value: "" },
    volume: { operator: ">=", value: "" },
    sector: { value: "" },
  });
  const [companies, setCompanies] = useState([])

  const handleFilterChange = (
    field: FilterField,
    key: "operator" | "value",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: { ...prev[field], [key]: value },
    }));
  };
  const handleSubmit = async () => {
    try {
      //await sendMessage({ directMessage, content, attachment });
      console.log(searchQuery, filters);
      const response = await callApi(searchQuery, filters);

      console.log('response',response)
      setCompanies(response.top_matches.matches)
    } catch (error) {
      /*toast.error("Failed to send a message", {
        description:
          error instanceof Error ? error.message : "An unkown error ocurred",
      });*/
      console.log(error);
    }
  };
  return (
    <div className="m-4">
      <header className="flex flex-col items-center justify-center p-4 mb-2">
        <h1 className="font-bold text-4xl text-white">Automated Stock Analysis</h1>
      </header>
      <div className="mx-16 ">
        {/*<p className="text-center my-4 text-gray-300">
          Search for relevant stocks using queries or filter stocks listed on
          the NYSE by metrics such as Market Capitalization, Volume, or Sector.
        </p>*/}

        <div className="flex">
          <Input
            className="p-2 mr-2 bg-black bg-opacity-50 text-white border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            placeholder="Stocks"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button size={"icon"} onClick={handleSubmit}>
            <Search />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        
        <div className="mb-8 mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Market Cap Filter */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-white font-medium text-gray-700">
                Market Cap
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={filters.marketCap.operator}
                  onChange={(e) =>
                    handleFilterChange("marketCap", "operator", e.target.value)
                  }
                  className="p-2 bg-black bg-opacity-50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value=">=">≥</option>
                  <option value="<=">≤</option>
                </select>
                <Input
                  type="number"
                  placeholder="Value"
                  value={filters.marketCap.value ?? ''}
                  onChange={(e) =>
                    handleFilterChange("marketCap", "value", e.target.value)
                  }
                  className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Volume Filter */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-white font-medium text-gray-700">
                Volume
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={filters.volume.operator}
                  onChange={(e) =>
                    handleFilterChange("volume", "operator", e.target.value)
                  }
                  className="p-2 bg-black bg-opacity-50 text-white   rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value=">=">≥</option>
                  <option value="<=">≤</option>
                </select>
                <Input
                  type="number"
                  placeholder="Value"
                  value={filters.volume.value ?? ''}
                  onChange={(e) =>
                    handleFilterChange("volume", "value", e.target.value)
                  }
                  className="p-2  bg-black bg-opacity-50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Sector Filter */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-white font-medium text-gray-700">
                Sector
              </label>
              <select
                value={filters.sector.value}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sector: { ...prev.sector, value: e.target.value },
                  }))
                }
                className="p-2  bg-black bg-opacity-50 text-white  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Sectors</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Energy">Energy</option>
              </select>
            </div>
          </div>
        </div>

        

        {/* */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companies?.map((company: Company, index) => (
            <StockCard
              key={index}
              name={company.metadata.Name}
              description={company.metadata.text}
              city={company.metadata.City}
              country={company.metadata.Country}
              industry={company.metadata.Industry}
              link={company.metadata.Link}
              
            />
          ))}
        </div>
      </div>
    </div>
  );
}
