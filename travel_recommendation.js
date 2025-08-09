document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const searchResultsDiv = document.getElementById('search-results');
    let travelData = {};

    // Function to fetch data from the JSON file
    async function fetchTravelData() {
        try {
            // Corrected the file path
            const response = await fetch('travel_recommendation_api.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            travelData = await response.json();
        } catch (error) {
            console.error('Could not fetch travel data:', error);
            searchResultsDiv.innerHTML = '<p class="text-red-500">Error loading travel recommendations. Please try again later.</p>';
        }
    }

    // Function to create a card element
    function createCard(item) {
        const card = document.createElement('div');
        card.className = 'card';

        // Check if imageUrl exists, provide a placeholder if not
        const imageUrl = item.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${item.name}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-description">${item.description}</p>
                <a href="#" class="visit-button">Visit</a>
            </div>
        `;
        return card;
    }

    // Function to display search results
    function displayResults(results) {
        searchResultsDiv.innerHTML = ''; // Clear previous content

        if (results.length === 0) {
            const noResultsMessage = document.createElement('p');
            noResultsMessage.textContent = 'No results found. Try "beaches", "temples", or a country like "Japan".';
            searchResultsDiv.appendChild(noResultsMessage);
            return;
        }

        results.forEach(item => {
            searchResultsDiv.appendChild(createCard(item));
        });
    }

    // Function to perform the search
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            clearResults();
            return;
        }

        if (!travelData || Object.keys(travelData).length === 0) {
            console.error("Travel data is not loaded or is empty.");
            searchResultsDiv.innerHTML = '<p>Data is not available. Please try again later.</p>';
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
        // Combine all destinations into a single array with a 'type' for easier filtering
        const allDestinations = [
            ...(travelData.countries || []).flatMap(country => 
                country.cities.map(city => ({ ...city, type: 'city', country: country.name }))
            ),
            ...(travelData.temples || []).map(temple => ({ ...temple, type: 'temple' })),
            ...(travelData.beaches || []).map(beach => ({ ...beach, type: 'beach' }))
        ];

        // Filter the destinations based on the search term across multiple fields
        const results = allDestinations.filter(destination => {
            const name = destination.name.toLowerCase();
            const description = (destination.description || '').toLowerCase();
            const type = destination.type.toLowerCase();
            const country = (destination.country || '').toLowerCase();

            // Handle plural keywords like 'temples' or 'beaches'
            const singularSearchTerm = lowerCaseSearchTerm.endsWith('s') 
                ? lowerCaseSearchTerm.slice(0, -1) 
                : lowerCaseSearchTerm;

            return name.includes(lowerCaseSearchTerm) ||
                   description.includes(lowerCaseSearchTerm) ||
                   country.includes(lowerCaseSearchTerm) ||
                   type.includes(singularSearchTerm);
        });

        displayResults(results);
    }

    // Function to clear search results and input
    function clearResults() {
        searchResultsDiv.innerHTML = '';
        searchInput.value = '';
    }

    // Event Listeners
    searchBtn.addEventListener('click', performSearch);
    clearBtn.addEventListener('click', clearResults);
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // Initial fetch of data
    fetchTravelData();
});
