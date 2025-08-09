/**
 * Clears the search input field and all displayed results.
 */
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('result-info').textContent = '';
}

/**
 * Fetches travel data, performs a search based on user input,
 * and displays the results grouped by category.
 */
async function performSearch() {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchResultsDiv = document.getElementById('searchResults');
    const resultInfoP = document.getElementById('result-info');

    // Get and process the search query
    const query = searchInput.value.trim().toLowerCase();

    // Clear previous results
    searchResultsDiv.innerHTML = '';
    resultInfoP.textContent = '';
    
    // Exit if the query is empty
    if (!query) {
        resultInfoP.textContent = 'Please enter a keyword to search.';
        return;
    }

    try {
        // Fetch data from the JSON file
        const response = await fetch('travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const travelData = await response.json();

        // --- 1. Find all matching results ---
        let foundResults = [];

        // Search by category keywords
        if (query.includes('temple')) {
            foundResults.push(...travelData.temples);
        }
        if (query.includes('beach')) {
            foundResults.push(...travelData.beaches);
        }
        if (query.includes('country')) {
            travelData.countries.forEach(country => {
                foundResults.push(...country.cities);
            });
        }

        // Search by specific name (countries, cities, temples, beaches)
        travelData.countries.forEach(country => {
            if (country.name.toLowerCase().includes(query)) {
                foundResults.push(...country.cities);
            } else {
                country.cities.forEach(city => {
                    if (city.name.toLowerCase().includes(query)) {
                        foundResults.push(city);
                    }
                });
            }
        });

        travelData.temples.forEach(temple => {
            if (temple.name.toLowerCase().includes(query)) {
                foundResults.push(temple);
            }
        });

        travelData.beaches.forEach(beach => {
            if (beach.name.toLowerCase().includes(query)) {
                foundResults.push(beach);
            }
        });
        
        // Remove any duplicate results based on the item name
        const uniqueResults = Array.from(new Map(foundResults.map(item => [item.name, item])).values());
        
        // --- 2. Display the results ---
        if (uniqueResults.length === 0) {
            resultInfoP.textContent = `No results found for "${searchInput.value}"`;
        } else {
            resultInfoP.textContent = `Showing results for "${searchInput.value}":`;

            // Group results by their category
            const groupedResults = {
                cities: [],
                temples: [],
                beaches: []
            };

            const templeNames = new Set(travelData.temples.map(t => t.name));
            const beachNames = new Set(travelData.beaches.map(b => b.name));

            uniqueResults.forEach(item => {
                if (templeNames.has(item.name)) {
                    groupedResults.temples.push(item);
                } else if (beachNames.has(item.name)) {
                    groupedResults.beaches.push(item);
                } else {
                    groupedResults.cities.push(item);
                }
            });

            // A helper function to render a group of cards
            const renderGroup = (title, items) => {
                if (items.length === 0) return; // Don't render empty groups

                searchResultsDiv.innerHTML += `<h2>${title}</h2>`;

                const cardsHTML = items.map(item => {
                    const image = item.imageUrl 
                        ? `<img src="${item.imageUrl}" alt="${item.name}">` 
                        : '<img src="https://via.placeholder.com/300x150.png?text=No+Image" alt="No image available">';
                    
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.name)}`;

                    return `
                        <div class="result-card">
                            ${image}
                            <div class="card-content">
                                <h3>${item.name}</h3>
                                <p>${item.description}</p>
                                <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="visit-btn">Visit</a>
                            </div>
                        </div>
                    `;
                }).join('');

                searchResultsDiv.innerHTML += `<div class="card-grid">${cardsHTML}</div>`;
            };
            
            // Render each category group to the page
            renderGroup('Cities', groupedResults.cities);
            renderGroup('Temples', groupedResults.temples);
            renderGroup('Beaches', groupedResults.beaches);
        }

    } catch (error) {
        console.error("Could not fetch travel data:", error);
        resultInfoP.textContent = 'Error loading data. Please try again.';
    }
}

/**
 * Adds an event listener to the search input to allow searching by pressing the 'Enter' key.
 */
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

const options = { timeZone: 'America/New_York', hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const newYorkTime = new Date().toLocaleTimeString('en-US', options);
    console.log("Current time in New York:", newYorkTime);


