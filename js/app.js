(function () {
    "use strict";

    var activeFilter = "all";

    var searchInput = document.getElementById("search");
    var noResults = document.getElementById("no-results");
    var cards = document.querySelectorAll(".card");
    var filterButtons = document.querySelectorAll(".filter-btn");

    function applyFilters() {
        var query = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        var visibleCount = 0;

        cards.forEach(function (card) {
            var category = card.getAttribute("data-cat") || "";

            var searchData =
                (card.getAttribute("data-search") || "") +
                " " +
                (card.innerText || "");

            searchData = searchData.toLowerCase();

            var matchesCategory =
                activeFilter === "all" ||
                category === activeFilter;

            var matchesSearch =
                query === "" ||
                searchData.indexOf(query) !== -1;

            if (matchesCategory && matchesSearch) {
                card.classList.remove("hidden");
                visibleCount++;
            } else {
                card.classList.add("hidden");
            }
        });

        if (noResults) {
            noResults.style.display =
                visibleCount === 0 ? "block" : "none";
        }
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            activeFilter =
                button.getAttribute("data-filter") || "all";

            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    applyFilters();
})();
