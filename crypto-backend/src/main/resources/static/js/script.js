document.addEventListener('DOMContentLoaded', () => {
    // --- Global Utility Functions ---
    const getPageName = () => {
        const path = window.location.pathname;
        return path.substring(path.lastIndexOf('/') + 1);
    };

    const updateActiveLink = () => {
        const pageName = window.location.pathname.split('/').pop();
        const links = document.querySelectorAll('.side-menu a');

        links.forEach(link => {
            link.classList.remove('active');
            if (link.href.endsWith(pageName)) {
                link.classList.add('active');
            }
        });
    };

    const checkLoginStatus = () => {
        const userProfile = document.getElementById('user-profile');
        const userNameSpan = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logout-btn');
        const loggedInUser = localStorage.getItem('username');

        if (loggedInUser) {
            if (userProfile && userNameSpan) {
                userNameSpan.textContent = loggedInUser;
                userProfile.style.display = 'flex';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.addEventListener('click', logout);
            }
        } else {
            if (userProfile) {
                userProfile.style.display = 'none';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    };

    // --- Reusable Search Function ---
    const setupTableSearch = (searchInputClass, tableBodyId) => {
        const searchInput = document.querySelector(searchInputClass);
        const tableBody = document.getElementById(tableBodyId);

        if (searchInput && tableBody) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = tableBody.querySelectorAll('tr');

                rows.forEach(row => {
                    const coinName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                    const symbolElement = row.querySelector('td:nth-child(2) img');
                    const symbol = symbolElement ? symbolElement.getAttribute('alt').replace(' icon', '').toLowerCase() : '';

                    if (coinName.includes(searchTerm) || symbol.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }
    };

    // --- Page-specific Initialization Functions ---
    const initDashboard = async () => {
        const metricsGrid = document.getElementById('metrics-grid');
        const dataTableBody = document.getElementById('live-data-table-body');

        if (!metricsGrid || !dataTableBody) {
            console.error('Dashboard elements not found.');
            return;
        }

        try {
            const [coinsResponse, globalResponse] = await Promise.all([
                fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'),
                fetch('https://api.coingecko.com/api/v3/global')
            ]);

            if (!coinsResponse.ok || !globalResponse.ok) {
                throw new Error('Failed to fetch data from CoinGecko.');
            }

            const coins = await coinsResponse.json();
            const globalData = await globalResponse.json();

            // Update metrics section
            const totalMarketCap = globalData.data.total_market_cap.usd.toLocaleString();
            const totalVolume = globalData.data.total_volume.usd.toLocaleString();
            const btcDominance = globalData.data.market_cap_percentage.btc.toFixed(2);

            metricsGrid.innerHTML = `
                <div class="metric-card">
                    <h3>Total Market Cap</h3>
                    <p>$${totalMarketCap}</p>
                </div>
                <div class="metric-card">
                    <h3>24h Volume</h3>
                    <p>$${totalVolume}</p>
                </div>
                <div class="metric-card">
                    <h3>BTC Dominance</h3>
                    <p>${btcDominance}%</p>
                </div>
                <div class="metric-card">
                    <h3>Active Cryptos</h3>
                    <p>${globalData.data.active_cryptocurrencies.toLocaleString()}</p>
                </div>
            `;

            // Populate the live market data table
            dataTableBody.innerHTML = '';
            coins.forEach((coin, index) => {
                const row = document.createElement('tr');
                const changeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><img src="${coin.image}" class="coin-icon" alt="${coin.symbol} icon"> ${coin.name}</td>
                    <td>$${coin.current_price.toLocaleString()}</td>
                    <td class="${changeClass}">${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : 'N/A'}%</td>
                    <td>$${coin.market_cap.toLocaleString()}</td>
                    <td>$${coin.total_volume.toLocaleString()}</td>
                `;
                dataTableBody.appendChild(row);
            });

            // Initialize search for this table
            setupTableSearch('.data-table .search-table input', 'live-data-table-body');

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            metricsGrid.innerHTML = '<p>Failed to load data. Please check your network.</p>';
            dataTableBody.innerHTML = '<tr><td colspan="6">Failed to load data.</td></tr>';
        }
    };

    const initMarket = async () => {
        const tableBody = document.getElementById('market-full-table-body');

        if (!tableBody) {
            console.error('Market table body not found.');
            return;
        }

        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');

            if (!response.ok) {
                throw new Error('Failed to fetch data from CoinGecko');
            }

            const coins = await response.json();

            tableBody.innerHTML = ''; // Clear existing content

            coins.forEach((coin, index) => {
                const row = document.createElement('tr');
                const priceChange24hClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><img src="${coin.image}" class="coin-icon" alt="${coin.symbol} icon"> ${coin.name}</td>
                    <td>$${coin.current_price.toLocaleString()}</td>
                    <td class="${priceChange24hClass}">${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : 'N/A'}%</td>
                    <td>$${coin.market_cap.toLocaleString()}</td>
                    <td>$${coin.total_volume.toLocaleString()}</td>
                `;
                tableBody.appendChild(row);
            });

            setupTableSearch('.market-full-table .search-table input', 'market-full-table-body');

        } catch (error) {
            console.error('Error fetching market data:', error);
            tableBody.innerHTML = '<tr><td colspan="7">Failed to load data. Please check your network.</td></tr>';
        }
    };

    const initDeFi = async () => {
        const tableBody = document.getElementById('defi-table-body');
        if (!tableBody) {
            console.error('DeFi table body not found.');
            return;
        }

        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=decentralized_finance_defi&order=market_cap_desc&per_page=50&page=1&sparkline=false');

            if (!response.ok) {
                throw new Error('Failed to fetch DeFi data from CoinGecko');
            }

            const coins = await response.json();

            tableBody.innerHTML = '';

            coins.forEach((coin, index) => {
                const row = document.createElement('tr');
                const priceChangeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
                const marketCap = coin.market_cap ? `$${(coin.market_cap / 1_000_000_000).toFixed(2)}B` : 'N/A';

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><img src="${coin.image}" class="coin-icon" alt="${coin.symbol} icon"> ${coin.name}</td>
                    <td>$${coin.current_price.toLocaleString()}</td>
                    <td class="${priceChangeClass}">${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : 'N/A'}%</td>
                    <td>${marketCap}</td>
                    <td>N/A</td> `;
                tableBody.appendChild(row);
            });

            setupTableSearch('.market-full-table .search-table input', 'defi-table-body');

        } catch (error) {
            console.error('Error fetching DeFi data:', error);
            tableBody.innerHTML = '<tr><td colspan="6">Failed to load DeFi data. Please check your network.</td></tr>';
        }
    };

   // --- Updated Function: initNFTs ---
const initNFTs = async () => {
    const tableBody = document.getElementById('nfts-table-body');
    if (!tableBody) {
        console.error('NFTs table body not found.');
        return;
    }

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=non-fungible-tokens-nft&order=market_cap_desc&per_page=50&page=1&sparkline=false');

        if (!response.ok) {
            throw new Error('Failed to fetch NFTs data from CoinGecko');
        }
        const coins = await response.json();

        tableBody.innerHTML = '';

        coins.forEach((coin, index) => {
            const row = document.createElement('tr');
            const priceChange24hClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';

            row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${coin.image}" class="coin-icon" alt="${coin.symbol} icon"> ${coin.name}</td>
                <td>$${coin.current_price.toLocaleString()}</td>
                <td class="${priceChange24hClass}">${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : 'N/A'}%</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
                <td>N/A</td> `;
            tableBody.appendChild(row);
        });

        setupTableSearch('.market-full-table .search-table input', 'nfts-table-body');

    } catch (error) {
        console.error('Error fetching NFT data:', error);
        tableBody.innerHTML = '<tr><td colspan="6">Failed to load NFT data. Please check your network.</td></tr>';
    }
};
// Use 'non-fungible-tokens-nft' as the category ID for NFTs
    // --- New Function: initGaming ---
    const initGaming = async () => {
        const tableBody = document.getElementById('gaming-table-body');
        if (!tableBody) {
            console.error('Gaming table body not found.');
            return;
        }

        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=gaming&order=market_cap_desc&per_page=50&page=1&sparkline=false');

            if (!response.ok) {
                throw new Error('Failed to fetch Gaming data from CoinGecko');
            }
            const coins = await response.json();

            tableBody.innerHTML = '';

            coins.forEach((coin, index) => {
                const row = document.createElement('tr');
                const priceChange24hClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><img src="${coin.image}" class="coin-icon" alt="${coin.symbol} icon"> ${coin.name}</td>
                    <td>$${coin.current_price.toLocaleString()}</td>
                    <td class="${priceChange24hClass}">${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : 'N/A'}%</td>
                    <td>$${coin.market_cap.toLocaleString()}</td>
                    <td>N/A</td> `;
                tableBody.appendChild(row);
            });

            setupTableSearch('.market-full-table .search-table input', 'gaming-table-body');

        } catch (error) {
            console.error('Error fetching Gaming data:', error);
            tableBody.innerHTML = '<tr><td colspan="6">Failed to load Gaming data. Please check your network.</td></tr>';
        }
    };

   // --- Corrected Function: initWeb3 ---
const initWeb3 = async () => {
    const tableBody = document.getElementById('web3-table-body');
    if (!tableBody) {
        console.error('Web3 table body not found.');
        return;
    }

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=web3-gaming&order=market_cap_desc&per_page=50&page=1&sparkline=false');

        if (!response.ok) {
            throw new Error('Failed to fetch Web3 data from CoinGecko');
        }
        const coins = await response.json();

        tableBody.innerHTML = '';

        coins.forEach((coin, index) => {
            const row = document.createElement('tr');
            const priceChange24hClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';

            row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${coin.image}" class="coin-icon" alt="${coin.symbol} icon"> ${coin.name}</td>
                <td>$${coin.current_price.toLocaleString()}</td>
                <td class="${priceChange24hClass}">${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : 'N/A'}%</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
                <td>N/A</td> `;
            tableBody.appendChild(row);
        });

        setupTableSearch('.market-full-table .search-table input', 'web3-table-body');

    } catch (error) {
        console.error('Error fetching Web3 data:', error);
        tableBody.innerHTML = '<tr><td colspan="6">Failed to load Web3 data. Please check your network.</td></tr>';
    }
};


    // ... (The rest of the functions from your previous script: initCategoryPage, initArticles, initNews, etc.) ...

    // --- Main Initializer ---
    updateActiveLink();
    checkLoginStatus();

    const page = getPageName() || 'index.html';

    if (page === 'index.html') {
        initDashboard();
    } else if (page === 'market.html') {
        initMarket();
    } else if (page === 'defi.html') {
        initDeFi();
    } else if (page === 'nfts.html') {
        initNFTs();
    } else if (page === 'gaming.html') {
        initGaming();
    } else if (page === 'web3.html') {
        initWeb3();
    } else if (page === 'news.html') {
        initNews();
    } else if (page === 'articles.html' || page === 'publish.html') {
        initArticles();
    } else if (page === 'converter.html') {
        initConverter();
    } else if (page === 'alerts.html') {
        initAlerts();
    } else if (page === 'article-details.html') {
        initArticleDetails();
    } else if (['login.html', 'register.html'].includes(page)) {
        initAuth();
    }
});

// The remaining functions from the original script file go here
// (initArticles, initNews, initConverter, initAlerts, initArticleDetails, initAuth)

const initCategoryPage = (category) => {
    const pageHeader = document.querySelector('.page-header h1');
    if (pageHeader && pageHeader.textContent.includes(category)) {
        console.log(`Initializing ${category} page.`);
    }
};

const initArticles = () => {
    const articlesGrid = document.querySelector('.articles-grid');
    const publishForm = document.getElementById('article-form');
    const publishMessage = document.getElementById('publish-message');

    if (articlesGrid || publishForm) {
        console.log("Initializing Articles page.");

        const fetchAndRenderArticles = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/articles');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const articles = await response.json();

                if (articlesGrid) {
                    articlesGrid.innerHTML = '';
                    articles.forEach(article => {
                        const articleElement = document.createElement('a');
                        articleElement.href = `article-details.html?id=${article.id}`;
                        articleElement.className = 'article-card';
                        articleElement.innerHTML = `
                            <img src="${article.image}" alt="${article.title}">
                            <div class="article-card-content">
                                <h3>${article.title}</h3>
                                <p>${article.summary}</p>
                            </div>
                            <span class="delete-btn-wrapper"><span class="delete-btn" data-id="${article.id}">❌</span></span>
                        `;
                        articlesGrid.appendChild(articleElement);
                    });
                }
            } catch (error) {
                console.error('Error fetching articles:', error);
                if (articlesGrid) {
                    articlesGrid.innerHTML = '<p>Failed to load articles. Please try again later.</p>';
                }
            }
        };

        const deleteArticle = async (articleId) => {
            if (confirm("Are you sure you want to delete this article?")) {
                try {
                    const response = await fetch(`http://localhost:8080/api/articles/${articleId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        fetchAndRenderArticles();
                    } else {
                        alert('Failed to delete article.');
                    }
                } catch (error) {
                    console.error('Error deleting article:', error);
                    alert('An error occurred. Please check the console.');
                }
            }
        };

        if (publishForm) {
            publishForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const newArticle = {
                    title: document.getElementById('article-title').value,
                    image: document.getElementById('article-image').value,
                    content: document.getElementById('article-content').value,
                    summary: document.getElementById('article-content').value.substring(0, 150) + '...',
                };

                try {
                    const response = await fetch('http://localhost:8080/api/articles', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newArticle)
                    });

                    if (response.ok) {
                        publishMessage.classList.remove('hidden');
                        publishForm.reset();
                    } else {
                        publishMessage.textContent = 'Failed to publish article.';
                    }
                } catch (error) {
                    console.error('Error publishing article:', error);
                    publishMessage.textContent = 'An error occurred. Please try again.';
                }
            });
        }

        if (articlesGrid) {
            articlesGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) {
                    e.preventDefault();
                    const articleId = e.target.getAttribute('data-id');
                    deleteArticle(articleId);
                }
            });
        }

        fetchAndRenderArticles();
    }
};


const initNews = () => {
    const latestNewsContainer = document.getElementById('latest-news-container');
    const olderNewsList = document.getElementById('older-news-list');

    if (latestNewsContainer && olderNewsList) {
        console.log("Initializing News page.");

        const fetchAndRenderNews = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/articles');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const news = await response.json();

                if (news.length > 0) {
                    const latestNews = news[0];
                    const olderNews = news.slice(1);

                    latestNewsContainer.innerHTML = `
                        <a href="article-details.html?id=${latestNews.id}" class="latest-news-card">
                            <img src="${latestNews.image}" alt="${latestNews.title}" class="latest-news-image">
                            <div class="latest-news-content">
                                <h2>${latestNews.title}</h2>
                                <p class="latest-news-summary">${latestNews.summary}</p>
                            </div>
                        </a>
                    `;

                    olderNewsList.innerHTML = '';
                    olderNews.forEach(item => {
                        olderNewsList.innerHTML += `
                            <li>
                                <a href="article-details.html?id=${item.id}" class="older-news-item">
                                    <h3 class="older-news-title">${item.title}</h3>
                                    <p class="older-news-summary">${item.summary}</p>
                                </a>
                            </li>
                        `;
                    });
                } else {
                    latestNewsContainer.innerHTML = '<p>No news articles found.</p>';
                    olderNewsList.innerHTML = '';
                }
            } catch (error) {
                console.error('Error fetching news:', error);
                latestNewsContainer.innerHTML = '<p>Failed to load news. Please try again later.</p>';
                olderNewsList.innerHTML = '';
            }
        };

        fetchAndRenderNews();
    }
};

const initConverter = () => {
    const pageHeader = document.querySelector('.page-header h1');
    if (pageHeader && pageHeader.textContent.includes('Converter')) {
        console.log("Initializing Converter page.");
        const converterForm = document.getElementById('converter-form');
        const resultValue = document.getElementById('result-value');

        if (converterForm) {
            converterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const from = document.getElementById('from-currency').value;
                const to = document.getElementById('to-currency').value;
                const amount = parseFloat(document.getElementById('amount').value);

                const rates = { 'BTC': 68500, 'ETH': 3900, 'USD': 1, 'INR': 83.5 };
                const converted = (amount / rates[from]) * rates[to];

                resultValue.textContent = converted.toFixed(2);
            });
        }
    }
};

const initAlerts = () => {
    const pageHeader = document.querySelector('.page-header h1');
    if (pageHeader && pageHeader.textContent.includes('Alerts')) {
        console.log("Initializing Alerts page.");
        const alertForm = document.getElementById('alert-form');
        const alerts = JSON.parse(localStorage.getItem('alerts')) || [];
        const alertsTableBody = document.querySelector('.alerts-table tbody');

        const renderAlerts = () => {
            if(alertsTableBody) {
                alertsTableBody.innerHTML = '';
                alerts.forEach((alert, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${alert.coin}</td>
                        <td>$${alert.price.toLocaleString()}</td>
                        <td>Active</td>
                        <td><button class="btn btn-delete" data-index="${index}">Delete</button></td>
                    `;
                    alertsTableBody.appendChild(row);
                });
            }
        };

        if (alertForm) {
            alertForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const coin = document.getElementById('alert-coin').value.toUpperCase();
                const price = parseFloat(document.getElementById('alert-price').value);
                alerts.push({ coin, price });
                localStorage.setItem('alerts', JSON.stringify(alerts));
                alertForm.reset();
                renderAlerts();
            });
        }

        if (alertsTableBody) {
            alertsTableBody.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-delete')) {
                    const index = e.target.getAttribute('data-index');
                    alerts.splice(index, 1);
                    localStorage.setItem('alerts', JSON.stringify(alerts));
                    renderAlerts();
                }
            });
        }
        renderAlerts();
    }
};

const initArticleDetails = () => {
    const articleContainer = document.getElementById('article-content-container');
    if (articleContainer) {
        console.log("Initializing Article Details page.");
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        if (articleId) {
            fetchArticle(articleId);
        } else {
            articleContainer.innerHTML = '<p>No article found.</p>';
        }
    }
};

const fetchArticle = async (id) => {
    const articleContainer = document.getElementById('article-content-container');
    try {
        const response = await fetch(`http://localhost:8080/api/articles/${id}`);
        if (!response.ok) {
            throw new Error('Article not found.');
        }
        const article = await response.json();

        articleContainer.innerHTML = `
            <h1 class="article-title">${article.title}</h1>
            <img src="${article.image}" alt="${article.title}" class="article-image">
            <div class="article-body">
                <p>${article.content}</p>
            </div>
        `;

    } catch (error) {
        console.error('Error fetching article:', error);
        articleContainer.innerHTML = '<p>Failed to load article. Please try again.</p>';
    }
};

const initAuth = () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const authMessage = document.getElementById('auth-message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:8080/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const message = await response.text();
                authMessage.textContent = message;
                authMessage.classList.remove('hidden', 'error', 'success');
                authMessage.classList.add(response.ok ? 'success' : 'error');

            } catch (error) {
            console.error('Error during registration:', error);
            authMessage.textContent = 'Network error. Please try again.';
            authMessage.classList.remove('hidden', 'success');
            authMessage.classList.add('error');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const message = await response.text();
                authMessage.textContent = message;
                authMessage.classList.remove('hidden', 'error', 'success');
                authMessage.classList.add(response.ok ? 'success' : 'error');

                if (response.ok) {
                    localStorage.setItem('username', username);
                    window.location.href = 'index.html';
                }

            } catch (error) {
                console.error('Error during login:', error);
                authMessage.textContent = 'Network error. Please try again.';
                authMessage.classList.remove('hidden', 'success');
                authMessage.classList.add('error');
            }
        });
    }
};