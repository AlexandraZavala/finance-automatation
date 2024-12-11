interface MarketCapFilter {
  operator: string; // e.g., ">=", "<="
  value: string | null; // The value can be a number or null
}

interface VolumeFilter {
  operator: string; // e.g., ">=", "<="
  value: string | null; // The value can be a number or null
}

interface Filters {
  marketCap: MarketCapFilter;
  volume: VolumeFilter;
  sector: {
    //operator: string; // e.g., "==", "!="
    value: string; // The value can be a string (e.g., sector name)
  };
}

interface Company {
  metadata: {
    Name: string;
    text: string;
    City: string;
    Country: string;
    Industry: string;
    Link: string;
  };
}
export type { Company, Filters };
