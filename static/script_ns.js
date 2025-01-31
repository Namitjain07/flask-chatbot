window.onload = function () {
    Particles.init({
        selector: '.background',
        maxParticles: 30,
        connectParticles: true,
        speed: 2,
        minDistance: 250,
        sizeVariations: 4,
        color: 'd9d9d9',
    });
};

document.addEventListener('DOMContentLoaded', async function() {

    document.getElementById('card_container').style.display="none";
    await fetchAndDisplayArticles("hello");
    document.getElementById('card_container').style.display="flex";
    const cardContainer = document.getElementById('card_container');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const toatlcardsatonce=3;
    let currentIndex = 0;
    const cardWidth = document.querySelector('.card__article').offsetWidth +4+16+16; // card width + margin
    const totalCards = document.querySelectorAll('.card__article').length;

    // Add total cards based on the HTML structure
    nextBtn.addEventListener('click', () => {
        console.log("clicked button2");
        console.log(totalCards);
        if (currentIndex < totalCards - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;  // Loop back to the first card
        }
        cardContainer.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    });
    
    prevBtn.addEventListener('click', () => {
        console.log("clicked button1")
        console.log(totalCards);
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalCards - 3;  // Loop back to the last card
        }
        cardContainer.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    });





});



 async function fetchAndDisplayArticles(query) {
    await fetch("/fetchnews", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
    })
    .then(response => response.json())
    .then(data => {
        const newslist = data.newslist;
        const newsContainer = document.getElementById("card_container");

        // Clear previous content
        newsContainer.innerHTML = '';

        // Append each article item to the news container
        console.log(newslist.length)
        for (let i = 0; i < newslist.length; i++) {
            const article = document.createElement("article");
            article.className = "card__article";

            // Create image element
            const img = document.createElement("img");
            img.src = newslist[i].image_url || "{{ url_for('static', filename='landscape-1.png') }}"; // Default image if none available
            img.alt = "image";
            img.className = "card__img";

            // Create article data container
            const dataContainer = document.createElement("div");
            dataContainer.className = "card__data";

            // Create title element
            const title = document.createElement("h2");
            title.className = "card__title";
            title.textContent = newslist[i].title;

            // Create "Read More" button
            const readMoreButton = document.createElement("a");
            readMoreButton.href = newslist[i].link; // Link to the full article
            readMoreButton.className = "card__button";
            readMoreButton.textContent = "Read More";
            readMoreButton.target = "_blank"; // Open in a new tab

            // Append elements to the data container
            dataContainer.appendChild(title);
            dataContainer.appendChild(readMoreButton);

            // Append image and data container to the article
            article.appendChild(img);
            article.appendChild(dataContainer);

            // Append the article to the news container
            newsContainer.appendChild(article);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}
