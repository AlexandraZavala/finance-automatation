import { useState } from "react";

interface StockCardProps {
  name: string;
  description: string;
  city: string;
  country: string;
  industry: string;
  link: string;
  additionalInfo?: string; 
}

const StockCard: React.FC<StockCardProps> = ({
  name,
  description,
  city,
  country,
  industry,
  link,
  additionalInfo,
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // State to track if the full description is shown

  const toggleDescription = () => {
    setIsExpanded((prev) => !prev); // Toggle the state
  };
  return (
    <div className=" p-4 bg-black bg-opacity-80 text-white rounded-2xl rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold mb-2">{name}</h2>
      <p className="text-gray-600">
        {isExpanded ? description : `${description.substring(0, 100)}...`}{" "}
        {/* Show truncated or full description */}
      </p>
      <button
        onClick={toggleDescription}
        className="mb-4 text-sm text-blue-500 hover:underline mb-2 text-xs"
      >
        {isExpanded ? "See Less" : "See more"}
      </button>
      <p className="text-gray-600 mb-4 text-xs">
        <strong>Location:</strong> {city}, {country}
      </p>
      <p className="text-gray-600 mb-4  text-xs">
        <strong>Industry:</strong> {industry}
      </p>
      {additionalInfo && (
        <p className="text-sm text-gray-500 mb-4">{additionalInfo}</p>
      )}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        Visit
      </a>
    </div>
  );
};

export default StockCard;
