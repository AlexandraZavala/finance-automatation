interface StockCardProps {
  name: string;
  description: string;
  link: string;
  additionalInfo?: string; // Campo opcional
}

const StockCard: React.FC<StockCardProps> = ({
  name,
  description,
  link,
  additionalInfo,
}) => {
  return (
    <div className=" p-4 bg-black bg-opacity-80 text-white rounded-2xl rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold mb-2">{name}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
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
