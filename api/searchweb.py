from googlesearch import search
import requests
from bs4 import BeautifulSoup
from cohere_chat import init_client, fetch_response
import random
import time

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/120.0",
]

def get_random_headers():
    """Return headers with a random User-Agent."""
    return {"User-Agent": random.choice(USER_AGENTS)}

def get_search_results(query, num_results=5):
    """Fetch top search results for a query."""
    return [url for url in search(query, num_results=num_results)]

def scrape_content(url):
    """Scrape and extract main content from a given URL."""
    try:
        response = requests.get(url, headers=get_random_headers())

        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Extract text from relevant paragraphs
        paragraphs = soup.find_all("p")
        content = "\n".join([p.get_text() for p in paragraphs[:5]])  # Limit to first 5 paragraphs

        return content if content else "No relevant content found."

    except requests.exceptions.RequestException as e:
        return f"Error fetching {url}: {e}"

def summarize_text(client, text):
    """Summarize extracted content into 5-7 important bullet points."""
    messages = [
        {"role": "system", "content": "Summarize the following text into 5 to 7 bullet points, including only the most important details."},
        {"role": "user", "content": text}
    ]
    return fetch_response(client, messages)

if __name__ == "__main__":
    query = input("Enter search query: ")  # User input for query
    urls = get_search_results(query)

    all_text = ""
    for url in urls:
        print(f"Scraping: {url}")
        text = scrape_content(url)
        all_text += f"\n\nSource: {url}\n{text}"
    
    # Random sleep between 2 to 5 seconds
        sleep_time = random.uniform(0, 1)
        print(f"Sleeping for {sleep_time:.2f} seconds to avoid detection...")
        time.sleep(sleep_time)

    print("\nCollected Content:", all_text)

    # Initialize Cohere and summarize
    co = init_client()
    summary = summarize_text(co, all_text)
    
    print("\nSummary:\n", summary)
