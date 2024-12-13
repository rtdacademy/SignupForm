import React from 'react';
import { Card, CardContent } from "../components/ui/card";
import { FileText, Image, Phone, Coins, Languages } from 'lucide-react';
import { countries } from 'countries-list';
import { ScrollArea } from '../components/ui/scroll-area';

const InternationalDocuments = ({ documents }) => {
  if (!documents) return null;

  const getCountryData = (countryCode) => {
    if (!countryCode) return null;
    const country = countries[countryCode.toUpperCase()];
    if (!country) return null;

    // Create emoji flag from country code
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    const emoji = String.fromCodePoint(...codePoints);

    return {
      ...country,
      code: countryCode.toUpperCase(),
      emoji
    };
  };

  const getFileIcon = (url) => {
    if (!url) return <FileText className="h-5 w-5" />;
    const extension = url.split('.').pop().toLowerCase();
    return extension === 'pdf' ? <FileText className="h-5 w-5" /> : <Image className="h-5 w-5" />;
  };

  const getDocumentName = (key) => {
    const names = {
      passport: 'Passport',
      additionalID: 'Additional ID',
      residencyProof: 'Proof of Residency'
    };
    return names[key] || key;
  };

  const countryData = getCountryData(documents.countryOfOrigin);

  return (
    <ScrollArea className="flex-1 -mx-4">
      <div className="space-y-6 px-4 pb-4">
        {/* Country Information Section */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            {countryData ? (
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  
                  <span className="font-medium">{countryData.name}</span>
                  {countryData.native !== countryData.name && (
                    <span className="text-gray-600">({countryData.native})</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">
                      <span className="text-gray-600">Calling Code:</span> +{countryData.phone.join(', +')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">
                      <span className="text-gray-600">Currency:</span> {countryData.currency.join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 md:col-span-2">
                    <Languages className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">
                      <span className="text-gray-600">Languages:</span> {countryData.languages.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Country information not available</p>
            )}
          </CardContent>
        </Card>

        {/* Documents Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          <div className="grid gap-4">
            {Object.entries(documents).map(([key, url]) => {
              if (key === 'countryOfOrigin') return null;
              if (!url) return null;
              
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="transition-all hover:shadow-md hover:bg-gray-50">
                    <CardContent className="p-4 flex items-center space-x-3">
                      {getFileIcon(url)}
                      <span className="flex-1 text-blue-600 hover:text-blue-800">
                        {getDocumentName(key)}
                      </span>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default InternationalDocuments;