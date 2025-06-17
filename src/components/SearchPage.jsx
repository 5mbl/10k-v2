"use client"

import { useState, useEffect } from "react"
import { Search, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import useQueryStore from "@/store/useQueryStore"
import { mockResults } from "@/app/mocks/data"
import { queryHybrid } from "@/lib/query"


export default function SearchPage() {
  const { userQuery, setUserQuery, clearUserQuery } = useQueryStore()
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState([])
  const [expandedQuestions, setExpandedQuestions] = useState({})

  //console.log("userQuery:",userQuery)

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      console.log("searching for:", searchQuery)
      const results = await queryHybrid(searchQuery)
      console.log('✅ RAG Response:', results)
      
      // Ensure results is an array
      if (Array.isArray(results)) {
        setResults(results)
      } else if (results && typeof results === 'object') {
        // If it's a single result object, wrap it in an array
        setResults([results])
      } else {
        // If results is invalid, set empty array
        console.error('Invalid results format:', results)
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("handleSubmit")
    console.log("userQuery:",userQuery)

    handleSearch(userQuery)
  }

  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-tickers.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        {
          "description": "Tesla",
          "proName": "NASDAQ:TSLA"
        },
        {
          "description": "Apple",
          "proName": "NASDAQ:AAPL"
        },
        {
          "description": "Alphabet",
          "proName": "NASDAQ:GOOGL"
        },
        {
          "description": "Meta",
          "proName": "NASDAQ:META"
        },
        {
          "description": "Netflix",
          "proName": "NASDAQ:NFLX"
        },
        {
          "description": "Nvidia",
          "proName": "NASDAQ:NVDA"
        },
        {
          "description": "Microsoft",
          "proName": "NASDAQ:MSFT"
        }
      ],
      "isTransparent": false,
      "showSymbolLogo": true,
      "colorTheme": "light",
      "locale": "en"
    });

    // Find the widget container and append the script
    const widgetContainer = document.querySelector('.tradingview-widget-container__widget');
    if (widgetContainer) {
      widgetContainer.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (widgetContainer && script.parentNode) {
        widgetContainer.removeChild(script);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* TradingView Widget */}
      <div className="w-full max-w-6xl px-4 py-4">
        <div className="tradingview-widget-container">
          <div className="tradingview-widget-container__widget"></div>
          <div className="tradingview-widget-copyright">

          </div>
        </div>
      </div>

      <main className="w-full max-w-6xl px-4 py-6">
        <div className="flex flex-col items-center">
          {!hasSearched && (
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Stock Search</h1>
              <p className="text-lg text-gray-600 mb-2">Enter your search query to get started</p>
    
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-8">
            <div className="relative group">
              {/* Search Icon - Left Side */}
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200" />

              {/* Input Field */}
              <Input
                type="text"
                placeholder="Enter your search query..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 text-lg bg-white border-2 border-gray-200 rounded-2xl 
                         focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none
                         hover:border-gray-300 hover:shadow-md
                         transition-all duration-200 ease-in-out
                         placeholder:text-gray-400 placeholder:font-normal
                         shadow-sm"
                autoFocus
              />

              {/* Subtle glow effect on focus */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Helper text */}
            {userQuery && (
              <div className="mt-2 text-sm text-gray-500 px-4">
                Press Enter to search or click the search button
              </div>
            )}
          </form>


          {hasSearched && (
            <div className="w-full max-w-2xl space-y-8">
              {/* Results Info */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {isSearching ? (
                    "Searching..."
                  ) : (
                    <>
                      Results for <span className="font-medium">"{userQuery}"</span>
                    </>
                  )}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearUserQuery();
                    setHasSearched(false);
                    setResults([]);
                  }}
                  className="flex items-center gap-2"
                >
                  <ChevronUp className="w-4 h-4" />
                  Go Back
                </Button>
              </div>

              {isSearching ? (
                /* Loading State */
                <div className="space-y-4">
                  <Card className="p-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </Card>
                </div>
              ) : (
                /* Results */
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-4">
                        <div className="border-b pb-3">
                          <h4 className="font-medium text-gray-900">Original Query</h4>
                          <p className="text-gray-700 mt-1">{result.original_query}</p>
                        </div>

                        <div className="border-b pb-3">
                          <h5 className="font-medium text-gray-800 mb-2">Summary</h5>
                          <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>
                        </div>

                        <div className="space-y-4">
                          {result.subquestions.map((subquestion, subIndex) => (
                            <div key={subIndex} className="border-l-2 border-blue-200 pl-4">
                              <div className="flex items-start justify-between">
                                <h5 className="font-medium text-gray-800 mb-2">{subquestion.question}</h5>
                                <button
                                  onClick={() => toggleQuestion(subIndex)}
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                                >
                                  {expandedQuestions[subIndex] ? (
                                    <>
                                      Show less <ChevronUp className="w-4 h-4" />
                                    </>
                                  ) : (
                                    <>
                                      Read more <ChevronDown className="w-4 h-4" />
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className={`${!expandedQuestions[subIndex] ? 'line-clamp-3' : ''}`}>
                                {subquestion.type === 'qualitative' ? (
                                  <>
                                    <p className="text-gray-700 text-sm leading-relaxed">{subquestion.response}</p>
                                    {subquestion.retrieved_texts && (
                                      <div className="mt-4">
                                        <button
                                          onClick={() => toggleQuestion(`texts-${subIndex}`)}
                                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm mb-2"
                                        >
                                          {expandedQuestions[`texts-${subIndex}`] ? (
                                            <>
                                              Hide source texts <ChevronUp className="w-4 h-4" />
                                            </>
                                          ) : (
                                            <>
                                              Show source texts <ChevronDown className="w-4 h-4" />
                                            </>
                                          )}
                                        </button>
                                        {expandedQuestions[`texts-${subIndex}`] && (
                                          <div className="space-y-3">
                                            {subquestion.retrieved_texts.map((text, textIndex) => (
                                              <div key={textIndex} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="text-xs text-gray-500 mb-1">
                                                  {text.metadata?.file_name && (
                                                    <span className="font-medium">Source: {text.metadata.file_name}</span>
                                                  )}
                                                  {text.metadata?.page_label && (
                                                    <span className="ml-2">Page: {text.metadata.page_label}</span>
                                                  )}
                                                </div>
                                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{text.text}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-gray-700 text-sm space-y-1">
                                    <p><span className="font-medium">Company:</span> {subquestion.company}</p>
                                    <p><span className="font-medium">Ticker:</span> {subquestion.ticker}</p>
                                    <p><span className="font-medium">Year:</span> {subquestion.year}</p>
                                    <p><span className="font-medium">Metric:</span> {subquestion.metric}</p>
                                    <p><span className="font-medium">Value:</span> {subquestion.value}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 